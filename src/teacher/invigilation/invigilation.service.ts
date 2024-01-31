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

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<Slot>,
  ) {}

  //TODO: Get Unique Code and Rooms from supertable
  async assignInvigilator(assignInvigilatorDto: AssignInvigilatorDto, id: any) {
    const { unique_code } = assignInvigilatorDto;
    const invigilator_id = id;
    if (!invigilator_id) {
      throw new HttpException('Unauthorized', 401);
    }

    const curr_date = format(new Date(), 'yyyy-MM-dd');
    const curr_time_slot = new Date().getHours() < 12 ? 'Morning' : 'Evening';

    const curr_slot = await this.slotModel.findOne({
      date: curr_date,
      timeSlot: curr_time_slot,
    });

    if (!curr_slot) {
      throw new HttpException('Slot not found', 404);
    }

    // Unique code is used to prevent unauthorized access
    if (unique_code !== curr_slot.uniqueCode) {
      throw new HttpException('Invalid unique code', 400);
    }

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

    return {
      message: `Invigilator assigned`,
      data: {
        room: roomInvigilator.room_id,
        invigilator1: roomInvigilator.invigilator1_id,
      },
    };
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
    if (roomInvigilator.invigilator1_id.toString() === invigilatorId) {
      if (roomInvigilator.invigilator1_teacher_approval) {
        throw new HttpException('Invigilator already approved', 304);
      }
      if (!roomInvigilator.invigilator1_controller_approval) {
        throw new HttpException('Invigilator not approved by controller', 400);
      }
      roomInvigilator.invigilator1_teacher_approval = true;
    } else if (roomInvigilator.invigilator2_id.toString() === invigilatorId) {
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
    return {
      message: 'Teacher Approval Collected',
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
    const eligibleStudents = totalStudents - DebarredStudents - F_HoldStudents;

    return {
      message: 'Seating Plan',
      data: {
        room_no: room.room_no,
        total_students: totalStudents,
        eligible_students: eligibleStudents,
        debarred_students: DebarredStudents,
        f_hold_students: F_HoldStudents,
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
}
