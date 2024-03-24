import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { Model } from 'mongoose';
import { ApproveInvigilatorDto } from './dto/approve-invigilator.dto';
import {
  AddStudentDto,
  CreateSeatingPlanDto,
} from './dto/create-seating-plan.dto';
import { EditStudentEligibilityDto } from './dto/edit-student-eligibility.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { AddRoomToSlotDto } from './dto/add-room-to-slot.sto';
import { format } from 'date-fns';
import { EditContactDto } from './dto/edit-contact.dto';
import {
  PendingSupplies,
  PendingSuppliesDocument,
} from '../../schemas/pending-supplies.schema';
import { ChangeRoomStatusesDto } from './dto/change-room-statuses.dto';
import {
  ManualAssignDto,
  SetNumInvigilatorsDto,
} from './dto/update-invigilation.dto';
import { DutySheetUploadDto } from './dto/duty-sheet-upload.dto';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import {
  FlyingSquad,
  FlyingSquadDocument,
} from '../../schemas/flying-squad.schema';

@Injectable()
export class InvigilationService {
  private readonly logger = new Logger(InvigilationService.name);
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    @InjectModel(PendingSupplies.name)
    private pendingSuppliesModel: Model<PendingSuppliesDocument>,
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
  ) {}

  async getSlots() {
    try{
    return await this.slotModel
      .find()
      .sort({ date: -1, timeSlot: -1 })
      .populate('rooms', 'room_no -_id');
    }catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
  }
}

  async getSlot(id: string) {
    try{
    const slot = await (
      await (
        await (await this.slotModel.findById(id)).populate('rooms ufms')
      ).populate('rooms.room_invigilator_id')
    ).populate(
      'rooms.room_invigilator_id.invigilator1_id rooms.room_invigilator_id.invigilator2_id rooms.room_invigilator_id.invigilator3_id',
    );

    // If room has pending supply, change status to "PENDING_SUPPLIES"
    for (const room of slot.rooms) {
      const pendingSupplies = await this.pendingSuppliesModel.findOne({
        room_id: (room as any)._id,
      });

      if (!pendingSupplies) {
        continue;
      }

      const pending = pendingSupplies.pending_supplies.findIndex(
        (suppl) => suppl.quantity > 0,
      );

      if (pending !== -1) {
        (room as any).status = 'PENDING_SUPPLIES';
      }
    }

    return slot;
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async createRoom(createRoomDto: CreateRoomDto) {
    try{
    const room = new this.roomModel({
      room_no: createRoomDto.roomNo,
      block: createRoomDto.block,
      floor: createRoomDto.floor,
    });

    const room_id = room._id;
    const roomInvigilator = new this.roomInvigilatorModel({
      room_id,
    });
    room.room_invigilator_id = roomInvigilator._id.toString();

    await room.save();
    await roomInvigilator.save();

    return {
      message: `Created Room No: ${room.room_no}, ID: ${room._id}`,
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async getRoomWithApprovalPendingInvigilator() {
    try{
    const roomswithPendingInvigilator = await this.roomInvigilatorModel
      .find({
        $or: [
          {
            $and: [
              { invigilator1_controller_approval: false },
              {
                invigilator1_id: { $ne: null },
              },
            ],
          },
          {
            $and: [
              { invigilator2_controller_approval: false },
              {
                invigilator2_id: { $ne: null },
              },
            ],
          },
        ],
      })
      .populate('invigilator1_id')
      .populate('invigilator2_id')
      .populate('room_id');

    // Attach slots to rooms
    const roomIds = roomswithPendingInvigilator.map((room) => room.room_id);
    const slots = await this.slotModel.find({ rooms: { $in: roomIds } });

    const returnObj = roomswithPendingInvigilator.map((room) => {
      const temp = {};
      temp['room_id'] = (room.room_id as any)._id;
      temp['room_no'] = (room.room_id as any).room_no;
      temp['slot_time'] = slots.find((slot) =>
        (slot.rooms as any).includes((room.room_id as any)._id),
      ).timeSlot;
      if (room.invigilator1_id) {
        temp['invigilator1'] = {
          id: (room.invigilator1_id as any)._id,
          sap_id: (room.invigilator1_id as any).sap_id,
          name: (room.invigilator1_id as any).name,
          scan_date: room.invigilator1_assign_time.toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
          scan_time: room.invigilator1_assign_time.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
        };
        temp['invigilator1_controller_approval'] =
          room.invigilator1_controller_approval;
      }
      if (room.invigilator2_id) {
        temp['invigilator2'] = {
          id: (room.invigilator2_id as any)._id,
          sap_id: (room.invigilator2_id as any).sap_id,
          name: (room.invigilator2_id as any).name,
          scan_date: room.invigilator2_assign_time.toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
          scan_time: room.invigilator2_assign_time.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
        };
        temp['invigilator2_controller_approval'] =
          room.invigilator2_controller_approval;
      }
      if (room.invigilator3_id) {
        temp['invigilator3'] = {
          id: (room.invigilator3_id as any)._id,
          sap_id: (room.invigilator3_id as any).sap_id,
          name: (room.invigilator3_id as any).name,
          scan_date: room.invigilator3_assign_time.toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
          scan_time: room.invigilator3_assign_time.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
          }),
        };
        temp['invigilator3_controller_approval'] =
          room.invigilator3_controller_approval;
      }
      return temp;
    });
    return returnObj;
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async rejectInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    controllerId: string,
  ) {
    try{
    const room = await this.roomModel.findById(approveInvigilatorDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const roomInvigilator = await this.roomInvigilatorModel.findById(
      room.room_invigilator_id,
    );

    let rejectedInvigilator;

    if (
      roomInvigilator.invigilator1_id?.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      await roomInvigilator.populate('invigilator1_id', 'sap_id name');
      rejectedInvigilator = roomInvigilator.invigilator1_id;

      roomInvigilator.invigilator1_controller_approval = false;
      roomInvigilator.invigilator1_controller_approved_by = null;
      roomInvigilator.invigilator1_id = null;
      roomInvigilator.invigilator1_assign_time = null;
      roomInvigilator.invigilator1_teacher_approval = false;
    } else if (
      roomInvigilator.invigilator2_id?.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      await roomInvigilator.populate('invigilator2_id', 'sap_id name');
      rejectedInvigilator = roomInvigilator.invigilator2_id;

      roomInvigilator.invigilator2_controller_approval = false;
      roomInvigilator.invigilator2_controller_approved_by = null;
      roomInvigilator.invigilator2_id = null;
      roomInvigilator.invigilator2_assign_time = null;
      roomInvigilator.invigilator2_teacher_approval = false;
    } else {
      throw new HttpException('Bad request', 400);
    }

    await roomInvigilator.save();

    return {
      message: 'Invigilator rejected. Name: ' + rejectedInvigilator.name,
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async approveInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    controllerId: string,
  ) {
    try{
    const room = await this.roomModel.findById(approveInvigilatorDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    const roomInvigilator = await this.roomInvigilatorModel.findById(
      room.room_invigilator_id,
    );

    let approvedInvigilator;

    if (
      roomInvigilator.invigilator1_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator1_controller_approval = true;
      roomInvigilator.invigilator1_teacher_approval = true;
      roomInvigilator.invigilator1_controller_approved_by = controllerId;
      await roomInvigilator.populate('invigilator1_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator1_id;
    } else if (
      roomInvigilator.invigilator2_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator2_controller_approval = true;
      roomInvigilator.invigilator2_teacher_approval = true;
      roomInvigilator.invigilator2_controller_approved_by = controllerId;
      await roomInvigilator.populate('invigilator2_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator2_id;
    } else if (
      roomInvigilator.invigilator3_id.toString() ===
      approveInvigilatorDto.invigilatorId
    ) {
      roomInvigilator.invigilator3_controller_approval = true;
      roomInvigilator.invigilator3_teacher_approval = true;
      roomInvigilator.invigilator3_controller_approved_by = controllerId;
      await roomInvigilator.populate('invigilator3_id', 'sap_id name');
      approvedInvigilator = roomInvigilator.invigilator3_id;
    } else {
      throw new HttpException('Bad request', 400);
    }

    await roomInvigilator.save();

    // delete password field from approved invigilator
    delete approvedInvigilator.password;

    return {
      message: 'Invigilator approved',
      data: {
        invigilator: approvedInvigilator,
      },
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async addStudentToRoom(body: AddStudentDto) {
    try{
    const room = await this.roomModel.findById(body.room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    if (room.status === 'COMPLETED') {
      throw new HttpException('Room already Completed', 400);
    }

    if (room.students.find((st) => st.sap_id === body.student.sap_id)) {
      throw new HttpException('Student already exists', 409);
    }

    if (room.students.find((st) => st.seat_no === body.student.seat_no)) {
      throw new HttpException('Seat already occupied', 409);
    }

    room.students.push(body.student as any);
    await room.save();

    return {
      message: 'Student added to room',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async createSeatingPlan(body: CreateSeatingPlanDto) {
    try{
    const roomDoc = await this.roomModel.findById(body.room_id);
    if (!roomDoc) {
      throw new HttpException('Room not found', 404);
    }

    roomDoc.students = body.seating_plan as any;

    if ((roomDoc.students.length as any) == 0) {
      throw new HttpException('Seating plan cannot be empty', 400);
    }

    if ((roomDoc.students.length as any) <= 30) {
      roomDoc.num_invigilators = 1;
    }

    if (
      (roomDoc.students.length as any) > 30 &&
      (roomDoc.students.length as any) <= 70
    ) {
      roomDoc.num_invigilators = 2;
    }

    if ((roomDoc.students.length as any) > 70) {
      roomDoc.num_invigilators = 3;
    }

    try {
      await roomDoc.save({
        validateBeforeSave: true,
      });
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    return {
      message: 'Seating plan updated',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async editStudentEligibility(body: EditStudentEligibilityDto) {
    try{
    const roomDoc = await this.roomModel.findById(body.room_id);
    if (!roomDoc) {
      throw new HttpException('Room not found', 404);
    }

    const stIdx = roomDoc.students.findIndex((st) => st.sap_id === body.sap_id);
    if (stIdx === -1) {
      throw new HttpException('Student not found', 404);
    }

    roomDoc.students[stIdx].eligible = body.eligible as any;

    try {
      await roomDoc.save({
        validateBeforeSave: true,
      });
    } catch (err) {
      throw new HttpException(err.message, 400);
    }

    return {
      message: 'Student eligibility updated',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
  }

  async createSlot(body: CreateSlotDto) {
    try{
    // return format(new Date(body.date), 'yyyy-MM-dd');
    const slotExists = await this.slotModel.findOne({
      date: format(new Date(body.date), 'yyyy-MM-dd'),
      timeSlot: body.timeSlot,
    });
    if (slotExists) {
      throw new HttpException('Slot already exists', 409);
    }
    // Random alphanumeric code 10 characters long
    const randomCode = Math.random().toString(36).substr(2, 10);

    if (body.type === 'Endsem' && body.timeSlot === 'Afternoon') {
      throw new HttpException('Invalid Slot TimeSlot', 400);
    }

    const slot = new this.slotModel({
      ...body,
      date: format(new Date(body.date), 'yyyy-MM-dd'),
      uniqueCode: randomCode,
    });
    return await slot.save();
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async addRoomToSlot(body: AddRoomToSlotDto) {
    try{
    const slot = await this.slotModel.findById(body.slotId);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    (slot.rooms as any).addToSet(...body.roomIds);
    await slot.save();

    return {
      message:
        'Rooms added to slot, Date: ' + slot.date + ', Time: ' + slot.timeSlot,
    };
  }catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async getTotalSupplies(room_id: string) {
    try{
    const supplies = await this.pendingSuppliesModel.findOne({
      room_id,
    });

    if (!supplies) {
      return { message: 'Total Supplies Info', data: [] };
    }

    const res = supplies.pending_supplies.map((suppl) => {
      return {
        type: suppl.suppl_type,
        quantity: suppl.total,
      };
    });

    return { message: 'Total Supplies Info', data: res };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async approveRoomSubmission(room_id: string) {
    try{
    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }

    if (room.status === 'COMPLETED') {
      throw new HttpException('Room already approved', 400);
    }

    room.status = 'COMPLETED';
    await room.save();

    return {
      message: 'Room submission approved',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async getContactDetails(slot_id: string) {
    try{
    const slot = await this.slotModel.findById(slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    return {
      message: 'Contact details',
      data: slot.contact,
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async updateContactDetails(body: EditContactDto) {
    try{
    const slot = await this.slotModel.findById(body.slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    slot.contact = body.contacts as any;
    await slot.save();

    return {
      message: 'Contact details updated',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}
  

  async getSupplies(room_id: string) {
    try{
    const supplies = await this.pendingSuppliesModel.findOne({
      room_id,
    });
    if (!supplies) {
      throw new HttpException('Supplies not found', 404);
    }
    return supplies;
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async getStudentList(room_id: string) {
    try{
    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }
    return room.students;
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async deleteSlot(slot_id: string) {
    try{
    const slot = await this.slotModel.findById(slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    if (!slot.isDeletable) {
      throw new HttpException('Slot is not deletable', 400);
    }

    const rooms = slot.rooms;
    await this.pendingSuppliesModel.deleteMany({ room_id: { $in: rooms } });
    await this.roomInvigilatorModel.deleteMany({ room_id: { $in: rooms } });
    await this.roomModel.deleteMany({ _id: { $in: rooms } });

    await slot.deleteOne();
    return {
      message: 'Slot deleted',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }

}

  async changeRoomStatus(body: ChangeRoomStatusesDto) {
    try{
    await this.roomModel.updateMany(
      { _id: { $in: body.room_ids } },
      { status: body.status },
    );

    return {
      message: 'Room statuses updated',
    };
  }catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}

  async manualAssign(body: ManualAssignDto, contId) {
    try {
      const slot = await this.slotModel.findById(body.slotId);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }
    if (!slot.isDeletable) {
      throw new HttpException(
        'Manual assignment of invigilator not allowed after random assignment started',
        400,
      );
    }

    const roomInv = await this.roomInvigilatorModel.findOne({
      room_id: body.roomId,
    });

    if (!roomInv) {
      throw new HttpException('Room not found', 404);
    }

    const invigilator = await this.roomInvigilatorModel.findOne({
      room_id: body.roomId,
      $or: [
        { invigilator1_id: body.invigilatorId },
        { invigilator2_id: body.invigilatorId },
        { invigilator3_id: body.invigilatorId },
      ],
    });

    if (invigilator) {
      throw new HttpException('Invigilator already assigned', 409);
    }

    const room = await this.roomModel.findById(body.roomId);

    if (!roomInv.invigilator1_id) {
      if (room.num_invigilators < 1) {
        throw new HttpException('Room does not require invigilator', 400);
      }
      roomInv.invigilator1_id = body.invigilatorId;
      roomInv.invigilator1_assign_time = new Date();
      roomInv.invigilator1_controller_approval = true;
      roomInv.invigilator1_controller_approved_by = contId;
      await roomInv.save();
    } else if (!roomInv.invigilator2_id) {
      if (room.num_invigilators < 2) {
        throw new HttpException('Room does not require invigilator', 400);
      }
      roomInv.invigilator2_id = body.invigilatorId;
      roomInv.invigilator2_assign_time = new Date();
      roomInv.invigilator2_controller_approval = true;
      roomInv.invigilator2_controller_approved_by = contId;
      await roomInv.save();
    } else if (!roomInv.invigilator3_id) {
      if (room.num_invigilators < 3) {
        throw new HttpException('Room does not require invigilator', 400);
      }
      roomInv.invigilator3_id = body.invigilatorId;
      roomInv.invigilator3_assign_time = new Date();
      roomInv.invigilator3_controller_approval = true;
      roomInv.invigilator3_controller_approved_by = contId;
      await roomInv.save();
    } else {
      throw new HttpException('Room already has 3 invigilators', 400);
    }

    return {
      message: 'Invigilator assigned to room',
    };
  }catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async setNumInvigilators(body: SetNumInvigilatorsDto) {
    try {
      const room = await this.roomModel.findById(body.room_id);

      if (!room) {
        throw new HttpException('Room not found', 404);
      }

      const roominv = await this.roomInvigilatorModel.findOne({
        room_id: body.room_id,
      });

      if (!roominv) {
        throw new HttpException('Room not found', 404);
      }

      if (body.num_inv < 1 || body.num_inv > 3) {
        throw new HttpException('Invalid number of invigilators', 400);
      }

      if (roominv.invigilator1_id && body.num_inv < 1) {
        throw new HttpException('Room already has invigilator', 400);
      }

      if (roominv.invigilator2_id && body.num_inv < 2) {
        throw new HttpException('Room already has 2 invigilators', 400);
      }

      if (roominv.invigilator3_id && body.num_inv < 3) {
        throw new HttpException('Room already has 3 invigilators', 400);
      }

      room.num_invigilators = body.num_inv;
      await room.save();

      return {
        message: 'Number of invigilators updated',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async dutySheetUpload(body: DutySheetUploadDto) {
    try{
    const slot = await this.slotModel.findById(body.slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    if (body.inv_sap_ids.filter((id) => body.fly_sap_ids.includes(id)).length) {
      throw new HttpException(
        'Invigilator and Flying Squad cannot be the same',
        400,
      );
    }

    slot.flying_squad = await Promise.all(
      body.fly_sap_ids.map(async (sap_id) => {
        const t_id = await this.teacherModel.findOne({ sap_id });

        if (!t_id) {
          throw new HttpException(
            `Teacher with SAP ID: ${sap_id} not found`,
            404,
          );
        }

        const check = await this.flyingSquadModel.findOne({
          teacher_id: t_id._id,
          slot: slot._id,
        });
        let flying;
        if (check) {
          flying = check;
        } else {
          flying = new this.flyingSquadModel({
            teacher_id: t_id._id,
            slot: slot._id,
            rooms_assigned: [],
          });
        }

        await flying.save();

        return flying._id.toString();
      }),
    );

    slot.inv_duties = await Promise.all(
      body.inv_sap_ids.map(async (sap_id) => {
        const t_id = await this.teacherModel.findOne({ sap_id });
        if (!t_id) {
          throw new HttpException(
            `Teacher with SAP ID: ${sap_id} not found`,
            404,
          );
        }

        return t_id._id.toString();
      }),
    );

    await slot.save();

    return {
      message: 'Duty Sheet uploaded',
    };
  } catch (err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new HttpException(err.message, 400);
    }
  }
}
}
