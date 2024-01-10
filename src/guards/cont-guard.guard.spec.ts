import { JwtService } from '@nestjs/jwt';
import { ExamContGuard } from './cont-guard.guard';
import {
  testControllerToken,
  testTeacherToken,
} from '../../test/stubs/jwt.stub';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { ExecutionContext } from '@nestjs/common';

describe('ContGuardGuard', () => {
  let guard: ExamContGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ExamContGuard, JwtService],
    }).compile();

    guard = module.get<ExamContGuard>(ExamContGuard);
    jwtService = module.get<JwtService>(JwtService);
    jwtService.verifyAsync = jest.fn().mockImplementation((token) => {
      if (token === testControllerToken()) {
        return Promise.resolve({
          id: '659ed845cb16351721150439',
          username: 'aniupadh',
          name: 'Aniruddh Dev Upadhyay',
          role: 'exam-controller',
        });
      }
      return Promise.resolve({
        id: '659ed845cb16351721150439',
        username: '',
        name: 'Aniruddh Dev Upadhyay',
        role: 'aa',
      });
    });
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    describe('can compile', () => {
      test('then it should compile', () => {
        expect(guard).toBeDefined();
      });
    });

    describe('when token is provided', () => {
      let request: Request;
      let context: ExecutionContext;
      let result: boolean;
      beforeEach(async () => {
        request = {
          headers: {
            authorization: 'Bearer ' + testControllerToken(),
          },
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
        result = await guard.canActivate(context);
      });

      test('then it should call jwtService.verifyAsync', () => {
        expect(jwtService.verifyAsync).toBeCalledWith(testControllerToken(), {
          secret: process.env.JWT_SECRET,
        });
      });
      test('then it should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when token is not provided', () => {
      let request: Request;
      let context: ExecutionContext;
      beforeEach(async () => {
        request = {
          headers: {},
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
      });

      test('then it should not call jwtService.verifyAsync', () => {
        expect(jwtService.verifyAsync).not.toBeCalled();
      });
      test('then it should throw an error', async () => {
        await expect(guard.canActivate(context)).rejects.toThrowError();
      });
    });

    describe('when token is invalid', () => {
      let request: Request;
      let context: ExecutionContext;
      beforeEach(async () => {
        request = {
          headers: {
            authorization: 'Bearer token',
          },
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
        jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce('error');
      });
      test('then it should throw an error', async () => {
        await expect(guard.canActivate(context)).rejects.toThrowError();
      });
    });

    describe('when token is valid but role is not exam-controller', () => {
      let request: Request;
      let context: ExecutionContext;
      beforeEach(async () => {
        request = {
          headers: {
            authorization: 'Bearer ' + testTeacherToken(),
          },
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
      });
      test('then it should throw an error', async () => {
        await expect(guard.canActivate(context)).rejects.toThrowError();
      });
    });
  });
});
