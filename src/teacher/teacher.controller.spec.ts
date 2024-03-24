import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import {
  createTeacherReq,
  createTeacherResp,
  findTeacherID,
  findTeacherbyIDResp,
  loginTeacherReq,
  loginTeacherResp,
} from '../../test/stubs/teacher.stub';
import { TeacherLoginDto } from './dto/teacher-login';
import { JwtService } from '@nestjs/jwt';

jest.mock('./teacher.service');
jest.mock('@nestjs/jwt');

describe('TestController', () => {
  let teacherController: TeacherController;
  let teacherService: TeacherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TeacherController],
      providers: [TeacherService, JwtService],
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

  describe('Find Teacher', () => {
    const id = findTeacherID();
    describe('when find is called', () => {
      test('then it should call teacherService', async () => {
        await teacherController.findOne(id);
        expect(teacherService.findOne).toBeCalledWith(id);
      });
      test('then it should return formatted response', async () => {
        const response = await teacherController.findOne(id);
        expect(response).toEqual(findTeacherbyIDResp());
      });
    });
    describe('when find is called with invalid id', () => {
      test('then it should throw an error', async () => {
        const invalidId = 'invalidId';
        await expect(
          teacherController.findOne(invalidId),
        ).rejects.toThrowError();
      });
    });
  });
});
