import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import {
  createTeacherReq,
  createTeacherResp,
} from '../../test/stubs/teacher.stub';

jest.mock('./teacher.service');

describe('TestController', () => {
  let teacherController: TeacherController;
  let teacherService: TeacherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TeacherController],
      providers: [TeacherService],
    }).compile();

    teacherController = module.get<TeacherController>(TeacherController);
    teacherService = module.get<TeacherService>(TeacherService);
    jest.clearAllMocks();
  });

  describe('Create Teacher', () => {
    type CreateTeacherResponse = {
      message: string;
      data: {
        sap_id: number;
        name: string;
        approved: boolean;
      };
    };

    describe('when create is called', () => {
      let response: CreateTeacherResponse;
      let createTeacherDto: CreateTeacherDto;
      beforeEach(async () => {
        createTeacherDto = createTeacherReq();
        response = await teacherController.create(createTeacherDto);
      });

      test('then it should call teacherService', () => {
        expect(teacherService.create).toBeCalledWith(createTeacherDto);
      });
      test('then it should return formatted response', () => {
        expect(response).toEqual(createTeacherResp());
      });
    });
  });
});
