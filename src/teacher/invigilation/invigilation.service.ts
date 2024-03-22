import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { AssignInvigilatorDto } from '../dto/assign-invigilator.dto';
import { ApproveInvigilatorDto } from '../dto/approve-Invigilator.dto';
import { MarkAttendanceDto } from '../dto/mark-attendance.dto';
import { format } from 'date-fns';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { IssueBSheetDto } from '../dto/issueBsheet.dto';
import {
  PendingSupplies,
  PendingSuppliesDocument,
} from '../../schemas/pending-supplies.schema';
import { UpdateSuppliesDto } from '../dto/update-supplies.dto';
import { SubmitControlletDto } from '../dto/submit.dto';
import {
  FlyingSquad,
  FlyingSquadDocument,
} from '../../schemas/flying-squad.schema';
import { ApproveFlyingDto } from '../dto/approve-flying.dto';

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<Slot>,
    @InjectModel(PendingSupplies.name)
    private pendingSuppliesModel: Model<PendingSuppliesDocument>,
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
  ) {}

  //TODO: Get Unique Code and Rooms from supertable
  async assignInvigilator(assignInvigilatorDto: AssignInvigilatorDto, id: any) {
    const { unique_code } = assignInvigilatorDto;
    const invigilator_id = id;
    if (!invigilator_id) {
      throw new HttpException('Unauthorized', 401);
    }

    const curr_slot = await this.slotModel.findOne({
      uniqueCode: unique_code,
    });

    if (!curr_slot) {
      throw new HttpException('Invalid unique code', 400);
    }

    const check_flying_squad = await this.flyingSquadModel
      .findOne({
        teacher_id: invigilator_id,
        slot: curr_slot._id,
      })
      .populate('rooms_assigned.room_id', 'room_no');

    if (check_flying_squad) {
      check_flying_squad.in_time = new Date();
      check_flying_squad.status = 'ongoing';
      return {
        message: 'Flying Squad member assigned',
        data: {
          slot: curr_slot._id,
          room_data: check_flying_squad.rooms_assigned.map((room) => {
            return {
              room_id: (room.room_id as any)._id,
              room_no: (room.room_id as any).room_no,
              status: room.status,
            };
          }),
        },
      };
    }

    if (curr_slot.isDeletable) {
      curr_slot.isDeletable = false;
      await curr_slot.save();
    }

    // Check if invigilator is already assigned
    const AllRooms = curr_slot.rooms;

    const checkInvigilator = await this.roomInvigilatorModel
      .findOne({
        room_id: { $in: AllRooms },
        $or: [
          {
            invigilator1_id: invigilator_id,
          },
          {
            invigilator2_id: invigilator_id,
          },
        ],
      })
      .populate('room_id');
    if (checkInvigilator) {
      return {
        message: `Invigilator assigned`,
        data: {
          room: checkInvigilator.room_id,
          invigilator1: {},
        },
      };
    }

    let emptyRooms = [];

    const roomsWithEmptyInvigilator1 = await this.roomInvigilatorModel
      .find({
        room_id: {
          $in: await this.roomModel
            .find({
              _id: { $in: AllRooms },
              num_invigilators: { $gte: 1 },
            })
            .select('_id'),
        },
        invigilator1_id: null,
      })
      .select('_id');

    if (roomsWithEmptyInvigilator1.length > 0) {
      emptyRooms = roomsWithEmptyInvigilator1;
    }
    if (emptyRooms.length === 0) {
      const roomsWithEmptyInvigilator2 = await this.roomInvigilatorModel
        .find({
          room_id: {
            $in: await this.roomModel
              .find({
                _id: { $in: AllRooms },
                num_invigilators: { $gte: 2 },
              })
              .select('_id'),
          },
          invigilator2_id: null,
        })
        .select('_id');

      if (roomsWithEmptyInvigilator2.length > 0) {
        emptyRooms = roomsWithEmptyInvigilator2;
      }
    }

    if (emptyRooms.length === 0) {
      // Find rooms in slot with more than 70 students
      const rooms = await this.roomModel.find({
        _id: { $in: AllRooms },
        num_invigilators: { $gte: 3 },
      });

      const roomInvigilators = await this.roomInvigilatorModel.find({
        room_id: { $in: rooms.map((room) => room._id) },
        invigilator3_id: null,
      });

      emptyRooms = roomInvigilators;
    }

    if (emptyRooms.length === 0) {
      throw new HttpException('No empty rooms', 400);
    }

    // Assign invigilator to a random empty room
    const randomAssignment = Math.floor(Math.random() * emptyRooms.length);
    const roomInvigilator = await this.roomInvigilatorModel
      .findById(emptyRooms[randomAssignment]._id)
      .populate('room_id')
      .populate('invigilator1_id');

    // Assign invigilator to the empty room
    if (roomInvigilator.invigilator1_id === null) {
      roomInvigilator.invigilator1_id = invigilator_id;
      roomInvigilator.invigilator1_assign_time = new Date();
    } else if (roomInvigilator.invigilator2_id === null) {
      roomInvigilator.invigilator2_id = invigilator_id;
      roomInvigilator.invigilator2_assign_time = new Date();
    } else {
      roomInvigilator.invigilator3_id = invigilator_id;
      roomInvigilator.invigilator3_assign_time = new Date();
    }
    await roomInvigilator.save();

    const invigilator1 = {
      sap_id: (roomInvigilator.invigilator1_id as any).sap_id,
      name: (roomInvigilator.invigilator1_id as any).name,
    };
    const invigilator2 = {
      sap_id: (roomInvigilator.invigilator2_id as any)?.sap_id,
      name: (roomInvigilator.invigilator2_id as any)?.name,
    };

    return {
      message: `Invigilator assigned`,
      data: {
        room: roomInvigilator.room_id,
        invigilator1,
        invigilator2,
      },
    };
  }

  async getSupplies(teacher_id: string, room_id: string) {
    const invigilator = await this.roomInvigilatorModel.findOne({
      room_id: room_id,
      $or: [
        {
          invigilator1_id: teacher_id,
        },
        {
          invigilator2_id: teacher_id,
        },
        {
          invigilator3_id: teacher_id,
        },
      ],
    });

    if (!invigilator) {
      throw new HttpException('Invigilator not assigned to this room', 404);
    }
    if (invigilator.invigilator1_id?.toString() == teacher_id) {
      if (invigilator.invigilator1_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    if (invigilator.invigilator2_id?.toString() == teacher_id) {
      if (invigilator.invigilator2_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    const pending = await this.pendingSuppliesModel.findOne({
      room_id: invigilator.room_id,
    });
    if (pending) {
      return {
        message: 'Pending Supplies Info',
        data: pending.pending_supplies.map((supply) => {
          return {
            type: supply.suppl_type,
            quantity: supply.quantity,
          };
        }),
      };
    }

    const room = await this.roomModel.findById(invigilator.room_id);

    return { message: 'Total Supplies Info', data: [] };
  }

  async approveInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    id: any,
  ) {
    const invigilatorId = id;
    if (!invigilatorId) {
      throw new HttpException('Unauthorized', 401);
    }
    const roomInvigilator = await this.roomInvigilatorModel.findOne({
      room_id: approveInvigilatorDto.roomId,
    });
    if (!roomInvigilator) {
      throw new HttpException('Room not found', 404);
    }
    if (roomInvigilator.invigilator1_id?.toString() === invigilatorId) {
      if (roomInvigilator.invigilator1_teacher_approval) {
        throw new HttpException('Invigilator already approved', 304);
      }
      if (!roomInvigilator.invigilator1_controller_approval) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
      roomInvigilator.invigilator1_teacher_approval = true;
    } else if (roomInvigilator.invigilator2_id?.toString() === invigilatorId) {
      if (roomInvigilator.invigilator2_teacher_approval) {
        throw new HttpException('Invigilator already approved', 304);
      }
      if (!roomInvigilator.invigilator2_controller_approval) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
      roomInvigilator.invigilator2_teacher_approval = true;
    } else {
      throw new HttpException('Invigilator not assigned', 404);
    }
    await roomInvigilator.save();

    const p_supplies = await this.pendingSuppliesModel.findOne({
      room_id: roomInvigilator.room_id,
    });

    if (p_supplies) {
      p_supplies.pending_supplies = approveInvigilatorDto.pending_supplies.map(
        (supply) => {
          return {
            suppl_type: supply.type,
            quantity: supply.quantity,
          };
        },
      ) as any;
      await p_supplies.save();

      return {
        message: 'Teacher Approval Collected',
      };
    }

    const pendingSupplies = new this.pendingSuppliesModel({
      room_id: roomInvigilator.room_id,
      pending_supplies: approveInvigilatorDto.pending_supplies.map((supply) => {
        return {
          suppl_type: supply.type,
          quantity: supply.quantity,
        };
      }),
    });

    await pendingSupplies.save();

    return {
      message: 'Teacher Approval Collected',
    };
  }

  async addSupplies(body: UpdateSuppliesDto, teacher_id: any) {
    const invigilator = await this.roomInvigilatorModel.findOne({
      room_id: body.room_id,
      $or: [
        {
          invigilator1_id: teacher_id,
        },
        {
          invigilator2_id: teacher_id,
        },
        {
          invigilator3_id: teacher_id,
        },
      ],
    });

    if (!invigilator) {
      throw new HttpException('Invigilator not assigned to this room', 404);
    }

    if (invigilator.invigilator1_id?.toString() == teacher_id) {
      if (invigilator.invigilator1_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    if (invigilator.invigilator2_id?.toString() == teacher_id) {
      if (invigilator.invigilator2_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    const pending = await this.pendingSuppliesModel.findOne({
      room_id: invigilator.room_id,
    });

    if (pending) {
      for (const supply of body.pending_supplies) {
        const idx = pending.pending_supplies.findIndex(
          (p_supply) => p_supply.suppl_type === supply.type.toLowerCase(),
        );
        if (idx === -1) {
          pending.pending_supplies.push({
            suppl_type: supply.type.toLowerCase(),
            quantity: supply.quantity,
            total: supply.quantity,
          });
        } else {
          pending.pending_supplies[idx].quantity += supply.quantity;
          pending.pending_supplies[idx].total += supply.quantity;
        }
      }

      await pending.save();

      return {
        message: 'Supplies Added',
      };
    }

    const pendingSupplies = new this.pendingSuppliesModel({
      room_id: invigilator.room_id,
      pending_supplies: body.pending_supplies.map((supply) => {
        return {
          suppl_type: supply.type.toLowerCase(),
          quantity: supply.quantity,
          total: supply.quantity,
        };
      }),
    });

    await pendingSupplies.save();

    return {
      message: 'Supplies Added',
    };
  }

  async updateSupplies(body: UpdateSuppliesDto, teacher_id: any) {
    const invigilator = await this.roomInvigilatorModel.findOne({
      room_id: body.room_id,
      $or: [
        {
          invigilator1_id: teacher_id,
        },
        {
          invigilator2_id: teacher_id,
        },
        {
          invigilator3_id: teacher_id,
        },
      ],
    });

    if (!invigilator) {
      throw new HttpException('Invigilator not assigned to this room', 404);
    }
    if (invigilator.invigilator1_id?.toString() == teacher_id) {
      if (invigilator.invigilator1_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    if (invigilator.invigilator2_id?.toString() == teacher_id) {
      if (invigilator.invigilator2_controller_approval === false) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
    }

    const pending = await this.pendingSuppliesModel.findOne({
      room_id: invigilator.room_id,
    });
    if (!pending) {
      throw new HttpException('No Pending Supplies found', 400);
    }

    for (const supply of body.pending_supplies) {
      const idx = pending.pending_supplies.findIndex(
        (p_supply) => p_supply.suppl_type === supply.type.toLowerCase(),
      );
      if (idx === -1) {
        throw new HttpException('Invalid Supply Type', 400);
      }
      if (supply.quantity > pending.pending_supplies[idx].quantity) {
        throw new HttpException('Invalid Quantity for ' + supply.type, 400);
      }

      pending.pending_supplies[idx].quantity = supply.quantity;
    }

    await pending.save();

    return {
      message: 'Supplies Updated',
    };
  }

  async getSeatingPlan(room_id: string) {
    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    // Seat number is a A1, B10, etc.
    // First letter is the row and the rest is the seat number
    // So final output will be the the highest letter and the highest number
    const highestSeatNo = room.students.reduce((acc, student) => {
      const accRow = acc[0];
      const accNum = parseInt(acc.slice(1));
      const stuRow = student.seat_no.charAt(0);
      const stuNum = parseInt(student.seat_no.slice(1));

      let final;

      if (stuRow > accRow) {
        final = stuRow;
      } else {
        final = accRow;
      }

      if (stuNum > accNum) {
        final += stuNum;
      } else {
        final += accNum;
      }

      return final;
    }, 'A1');

    const totalStudents = room.students.length;
    const DebarredStudents = room.students.filter(
      (student) => (student.eligible as any) === 'DEBARRED',
    ).length;
    const F_HoldStudents = room.students.filter(
      (student) => (student.eligible as any) === 'F_HOLD',
    ).length;
    const r_holdStudents = room.students.filter(
      (student) => (student.eligible as any) === 'R_HOLD',
    ).length;
    const eligibleStudents =
      totalStudents - DebarredStudents - F_HoldStudents - r_holdStudents;

    (room.students as any) = room.students.map((student) => {
      (student.eligible as any) = student.UFM ? 'UFM' : student.eligible;
      return student;
    });

    return {
      message: 'Seating Plan',
      data: {
        room_no: room.room_no,
        total_students: totalStudents,
        eligible_students: eligibleStudents,
        debarred_students: DebarredStudents,
        f_hold_students: F_HoldStudents,
        r_hold_students: r_holdStudents,
        highest_seat_no: highestSeatNo,
        seating_plan: room.students,
      },
    };
  }

  async markAttendance(body: MarkAttendanceDto, id: any) {
    const { room_id, sap_id, ans_sheet_number } = body;
    const invigilator_id = id;
    if (!invigilator_id) {
      throw new HttpException('Unauthorized', 401);
    }
    const checkInv = await this.roomInvigilatorModel.findOne({
      room_id,
      $or: [
        {
          invigilator1_id: invigilator_id,
        },
        {
          invigilator2_id: invigilator_id,
        },
      ],
    });
    if (!checkInv) {
      throw new HttpException('Invigilator not assigned to this room', 401);
    }

    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const stuIdx = room.students.findIndex(
      (student) => student.sap_id === sap_id,
    );
    if (stuIdx === -1) {
      throw new HttpException('Student not found', 404);
    }

    if (room.students[stuIdx].attendance) {
      throw new HttpException('Attendance already marked', 409);
    }

    if (room.students[stuIdx].eligible !== ('YES' as any)) {
      let message = `Student is not Eligible because of `;
      if (room.students[stuIdx].eligible === ('DEBARRED' as any)) {
        message += `Debarred`;
      }
      if (room.students[stuIdx].eligible === ('F_HOLD' as any)) {
        message += `Financial Hold`;
      }
      if (room.students[stuIdx].eligible === ('R_HOLD' as any)) {
        message += `Registration Hold`;
      }
      throw new HttpException(message, 400);
    }

    room.students[stuIdx].attendance = true;
    room.students[stuIdx].attendance_time = new Date();
    room.students[stuIdx].attendance_by = invigilator_id;
    room.students[stuIdx].ans_sheet_number = ans_sheet_number;

    await room.save();

    return {
      message: 'Attendance marked',
      data: room.students[stuIdx],
    };
  }

  async issueBSheet(body: IssueBSheetDto) {
    const room: RoomDocument = await this.roomModel.findById(body.room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const stuIdx = room.students.findIndex(
      (student) => student.seat_no === body.seat_no,
    );

    if (stuIdx === -1) {
      throw new HttpException('Invalid Seat Number', 404);
    }

    const student = room.students[stuIdx];

    if (!student.attendance) {
      throw new HttpException('Attendance not marked', 400);
    }

    student.b_sheet_count += body.count;

    await room.save();

    return {
      message: 'B Sheet Issued to ' + student.student_name,
    };
  }

  async getBSheet(room_id: string, sap_id: string) {
    const room: RoomDocument = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const stuIdx = room.students.findIndex(
      (student) => student.sap_id === parseInt(sap_id),
    );

    if (stuIdx === -1) {
      throw new HttpException('Invalid Sap ID', 404);
    }

    const student = room.students[stuIdx];

    return {
      message: 'Student Info',
      data: {
        name: student.student_name,
        sap_id: student.sap_id,
        seat_no: student.seat_no,
        b_sheet_count: student.b_sheet_count,
      },
    };
  }

  async getStatus(room_id: string) {
    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    return {
      message: 'Invigilation Status',
      data: room.status,
    };
  }

  async submitToController(id: any, body: SubmitControlletDto) {
    const unique_code = body.unique_code;
    const invigilator_id = id;

    if (!invigilator_id) {
      throw new HttpException('Unauthorized', 401);
    }

    const slot = await this.slotModel.findOne({
      uniqueCode: unique_code,
    });

    if (!slot) {
      throw new HttpException('Invalid unique code', 400);
    }

    const allRooms = slot.rooms;
    const invigilator = await this.roomInvigilatorModel.findOne({
      room_id: { $in: allRooms },
      $or: [
        {
          invigilator1_id: invigilator_id,
        },
        {
          invigilator2_id: invigilator_id,
        },
      ],
    });

    if (!invigilator) {
      throw new HttpException('Invalid Room', 404);
    }

    const room = await this.roomModel.findById(invigilator.room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    if (room.status === 'COMPLETED') {
      throw new HttpException('Already submitted to controller', 202);
    }

    if (room.status === 'APPROVAL') {
      return {
        message: 'Submitted to Controller',
      };
    }

    room.status = 'APPROVAL';

    await room.save();

    return {
      message: 'Submitted to Controller',
    };
  }

  async getContactDetails(slot_id: string) {
    const slot = await this.slotModel.findById(slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    return {
      message: 'Contact Details',
      data: slot.contact,
    };
  }

  async getInvigilators(room_id) {
    const invigilators = await this.roomInvigilatorModel
      .findOne({
        room_id,
      })
      .populate(
        'invigilator1_id invigilator2_id invigilator3_id',
        'name sap_id email phone',
      );

    if (!invigilators) {
      throw new HttpException('Room not found', 404);
    }

    return {
      message: 'Invigilators',
      data: {
        inv1: invigilators.invigilator1_id,
        inv2: invigilators.invigilator2_id,
        inv3: invigilators.invigilator3_id,
      },
    };
  }

  async approveFlyingVisit(body: ApproveFlyingDto, teacher_id: string) {
    const flying_squad = await this.flyingSquadModel.findById(
      body.flying_squad_id,
    );
    if (!flying_squad) {
      throw new HttpException('Flying Squad not found', 404);
    }

    const checkInv = await this.roomInvigilatorModel.findOne({
      room_id: body.room_id,
      $or: [
        {
          invigilator1_id: teacher_id,
        },
        {
          invigilator2_id: teacher_id,
        },
        {
          invigilator3_id: teacher_id,
        },
      ],
    });

    if (!checkInv) {
      throw new HttpException('Invigilator not assigned to this room', 403);
    }
    const room = flying_squad.rooms_assigned.filter(
      (room) => room.room_id == body.room_id,
    )[0];

    if (!room) {
      throw new HttpException('Room not found', 404);
    }
    if (room.status === 'approved') {
      throw new HttpException('Already approved', 400);
    }

    room.status = 'approved';

    await flying_squad.save();

    return {
      message: 'Flying Visit Approved',
    };
  }
}
