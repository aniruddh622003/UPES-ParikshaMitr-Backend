import { HttpException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { Model } from 'mongoose';
import { ApproveInvigilatorDto } from './dto/approve-invigilator.dto';
import { CreateSeatingPlanDto } from './dto/create-seating-plan.dto';
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

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    @InjectModel(PendingSupplies.name)
    private pendingSuppliesModel: Model<PendingSuppliesDocument>,
  ) {}

  async getSlots() {
    return await this.slotModel
      .find()
      .sort({ date: -1, timeSlot: -1 })
      .populate('rooms', 'room_no -_id');
  }

  async getSlot(id: string) {
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
  }

  async createRoom(createRoomDto: CreateRoomDto) {
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
  }

  async getRoomWithApprovalPendingInvigilator() {
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
  }

  async rejectInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    controllerId: string,
  ) {
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
  }

  async approveInvigilator(
    approveInvigilatorDto: ApproveInvigilatorDto,
    controllerId: string,
  ) {
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
  }

  async createSeatingPlan(body: CreateSeatingPlanDto) {
    const roomDoc = await this.roomModel.findById(body.room_id);
    if (!roomDoc) {
      throw new HttpException('Room not found', 404);
    }

    roomDoc.students = body.seating_plan as any;
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
  }

  async editStudentEligibility(body: EditStudentEligibilityDto) {
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
  }

  async createSlot(body: CreateSlotDto) {
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
  }

  async addRoomToSlot(body: AddRoomToSlotDto) {
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
  }

  async getTotalSupplies(room_id: string) {
    const room = await this.roomModel.findById(room_id);

    if (!room) {
      throw new HttpException('Room not found', 404);
    }

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

  async approveRoomSubmission(room_id: string) {
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
  }

  async getContactDetails(slot_id: string) {
    const slot = await this.slotModel.findById(slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    return {
      message: 'Contact details',
      data: slot.contact,
    };
  }

  async updateContactDetails(body: EditContactDto) {
    const slot = await this.slotModel.findById(body.slot_id);
    if (!slot) {
      throw new HttpException('Slot not found', 404);
    }

    slot.contact = body.contacts as any;
    await slot.save();

    return {
      message: 'Contact details updated',
    };
  }

  async getSupplies(room_id: string) {
    const supplies = await this.pendingSuppliesModel.findOne({
      room_id,
    });
    if (!supplies) {
      throw new HttpException('Supplies not found', 404);
    }
    return supplies;
  }

  async getStudentList(room_id: string) {
    const room = await this.roomModel.findById(room_id);
    if (!room) {
      throw new HttpException('Room not found', 404);
    }
    return room.students;
  }

  async deleteSlot(slot_id: string) {
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
  }

  async changeRoomStatus(body: ChangeRoomStatusesDto) {
    await this.roomModel.updateMany(
      { _id: { $in: body.room_ids } },
      { status: body.status },
    );

    return {
      message: 'Room statuses updated',
    };
  }
}
