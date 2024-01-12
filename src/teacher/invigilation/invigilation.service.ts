import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { AssignInvigilatorDto } from '../dto/assign-invigilator.dto';

@Injectable()
export class InvigilationService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
  ) {}

  //TODO: Get Unique Code and Rooms from supertable
  //TODO: Controller Approval and Teacher Approval
  async assignInvigilator(assignInvigilatorDto: AssignInvigilatorDto) {
    const { invigilator_id, unique_code } = assignInvigilatorDto;

    // Unique code is used to prevent unauthorized access
    if (unique_code !== '123456') {
      throw new HttpException('Invalid unique code', 400);
    }

    // Check if invigilator is already assigned
    const AllRooms = await this.roomModel.find().select('_id');
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
          {
            invigilator1_controller_approval: false,
          },
          {
            invigilator2_controller_approval: false,
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
}
