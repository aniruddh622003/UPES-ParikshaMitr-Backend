import { Test, TestingModule } from '@nestjs/testing';
import { ExamControllerController } from './exam-controller.controller';
import { ExamControllerService } from './exam-controller.service';
import { JwtService } from '@nestjs/jwt';
import { testControllerToken } from '../../test/stubs/jwt.stub';
import {
  CreateControllerReq,
  CreateControllerResp,
  LoginControllerReq,
  LoginControllerResp,
} from '../../test/stubs/exam-controller.stub';
import { LoginExamControllerDto } from './dto/exam-controller-login.dto';
import { CreateExamControllerDto } from './dto/create-exam-controller.dto';

jest.mock('./exam-controller.service');

describe('ExamControllerController', () => {
  let controller: ExamControllerController;
  let service: ExamControllerService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamControllerController],
      providers: [ExamControllerService, JwtService],
    }).compile();

    controller = module.get<ExamControllerController>(ExamControllerController);
    service = module.get<ExamControllerService>(ExamControllerService);
    jwtService = module.get<JwtService>(JwtService);

    jwtService.signAsync = jest.fn().mockResolvedValue(testControllerToken());
    jest.clearAllMocks();
  });

  describe('can compile', () => {
    test('then it should compile', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('Create Exam Controller', () => {
    type CreateControllerResponse = {
      message: string;
      data: {
        name: string;
      };
    };
    describe('when create is called', () => {
      let response: CreateControllerResponse;
      let createControllerDto: CreateExamControllerDto;
      beforeEach(async () => {
        createControllerDto = CreateControllerReq();
        response = await controller.create(createControllerDto);
      });

      test('then it should call ExamControllerService', () => {
        expect(service.create).toBeCalledWith(createControllerDto);
      });
      test('then it should return formatted response', () => {
        expect(response).toEqual(CreateControllerResp());
      });
    });

    describe('when login is called', () => {
      type LoginResponse = {
        message: string;
        token: string;
      };
      let response: LoginResponse;
      let loginControllerDto: LoginExamControllerDto;
      beforeEach(async () => {
        loginControllerDto = LoginControllerReq();
        response = await controller.login(loginControllerDto);
      });

      test('then it should call ExamControllerService', () => {
        expect(service.login).toBeCalledWith(loginControllerDto);
      });
      test('then it should return formatted response', () => {
        expect(response).toEqual(LoginControllerResp());
      });
    });
  });
});
