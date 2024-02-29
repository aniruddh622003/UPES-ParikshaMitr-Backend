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

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<Slot>,
    @InjectModel(PendingSupplies.name)
    private pendingSuppliesModel: Model<PendingSuppliesDocument>,
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

    // Check if invigilator is already assigned
    const AllRooms = curr_slot.rooms;
    const checkInvigilator = await this.roomInvigilatorModel.findOne({
      room_id: { $in: AllRooms },
      $or: [
        {
          invigilator1_id: invigilator_id,
        },
        {
          invigilator2_id: invigilator_id,
        },
      ],
    });
    if (checkInvigilator) {
      throw new HttpException('Invigilator already assigned', 400);
    }

    // Find all empty invigilation rooms
    const AllEmptyRoomsInvigilators = await this.roomInvigilatorModel
      .find({
        room_id: { $in: AllRooms },
        $or: [
          {
            invigilator1_id: null,
          },
          {
            invigilator2_id: null,
          },
        ],
      })
      .select('_id');

    // If no empty rooms, throw error
    if (AllEmptyRoomsInvigilators.length === 0) {
      throw new HttpException('No empty rooms', 400);
    }

    // Assign invigilator to a random empty room
    const randomAssignment = Math.floor(
      Math.random() * AllEmptyRoomsInvigilators.length,
    );
    const roomInvigilator = await this.roomInvigilatorModel
      .findById(AllEmptyRoomsInvigilators[randomAssignment]._id)
      .populate('room_id')
      .populate('invigilator1_id');

    // Assign invigilator to the empty room
    if (roomInvigilator.invigilator1_id === null) {
      roomInvigilator.invigilator1_id = invigilator_id;
      roomInvigilator.invigilator1_assign_time = new Date();
    } else {
      roomInvigilator.invigilator2_id = invigilator_id;
      roomInvigilator.invigilator2_assign_time = new Date();
    }
    await roomInvigilator.save();

    const invigilator1 = {
      sap_id: (roomInvigilator.invigilator1_id as any).sap_id,
      name: (roomInvigilator.invigilator1_id as any).name,
    };

    return {
      message: `Invigilator assigned`,
      data: {
        room: roomInvigilator.room_id,
        invigilator1,
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

    const qPaperNos = {};
    const ansSheetNos = room.students.length;

    for (let i = 0; i < room.students.length; i++) {
      if (!qPaperNos[room.students[i].subject]) {
        qPaperNos[room.students[i].subject] = 1;
      } else {
        qPaperNos[room.students[i].subject] += 1;
      }
    }

    const res = [{ type: 'Answer Sheet', quantity: ansSheetNos }];
    for (const key in qPaperNos) {
      res.push({ type: key + ' Question Paper', quantity: qPaperNos[key] });
    }
    return { message: 'Total Supplies Info', data: res };
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
      throw new HttpException('Bad request', 400);
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
        (p_supply) => p_supply.suppl_type === supply.type,
      );
      if (idx === -1) {
        throw new HttpException('Invalid Supply Type', 400);
      }
      if (supply.quantity > pending.pending_supplies[idx].quantity) {
        throw new HttpException('Invalid Quantity for ' + supply.type, 400);
      }
    }

    pending.pending_supplies = body.pending_supplies.map((supply) => {
      return {
        suppl_type: supply.type,
        quantity: supply.quantity,
      };
    }) as any;
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

    const highestSeatNo = room.students.reduce((prev, curr) => {
      return prev.seat_no > curr.seat_no ? prev : curr;
    }).seat_no;

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
      throw new HttpException('Already submitted to controller', 400);
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
}
