import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import {
  createTeacherReq,
  createTeacherResp,
  loginTeacherReq,
  loginTeacherResp,
} from '../../test/stubs/teacher.stub';
import { TeacherLoginDto } from './dto/teacher-login';

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

  describe('Login Teacher', () => {
    describe('when login is called', () => {
      type LoginTeacherResponse = {
        message: string;
        token: string;
      };
      let response: LoginTeacherResponse;
      let loginTeacherDto: TeacherLoginDto;
      beforeEach(async () => {
        loginTeacherDto = loginTeacherReq();
        response = await teacherController.login(loginTeacherDto);
      });

      test('then it should call teacherService', () => {
        expect(teacherService.login).toBeCalledWith(loginTeacherDto);
      });
      test('then it should return formatted response', () => {
        expect(response).toEqual(loginTeacherResp());
      });
    });
  });
});
