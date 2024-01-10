import { JwtService } from '@nestjs/jwt';
import { TeacherJwtGuard } from './teacher-jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { testInvalidToken, testTeacherToken } from '../../test/stubs/jwt.stub';

describe('JwtGuard', () => {
  let jwtGuard: TeacherJwtGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeacherJwtGuard, JwtService],
    }).compile();

    jwtGuard = module.get<TeacherJwtGuard>(TeacherJwtGuard);
    jwtService = module.get<JwtService>(JwtService);
    jwtService.verifyAsync = jest.fn().mockImplementation((token) => {
      if (token === testTeacherToken()) {
        return Promise.resolve({
          id: '659d39aa4043122701a08c28',
          sap_id: 500086707,
          name: 'Aniruddh Dev Upadhyay',
          role: 'teacher',
        });
      }
      return Promise.resolve({
        id: '659d39aa4043122701a08c28',
        sap_id: 500086707,
        name: 'Aniruddh Dev Upadhyay',
        role: 'aa',
      });
    });

    jwtService.signAsync = jest
      .fn()
      .mockResolvedValue(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQzOWFhNDA0MzEyMjcwMWEwOGMyOCIsInNhcF9pZCI6NTAwMDg2NzA3LCJuYW1lIjoiQW5pcnVkZGggRGV2IFVwYWRoeWF5IiwiaWF0IjoxNzA0ODgzNTE2fQ.A4HgoX772BaWM3yESWRTbS3wvXT_4PV_k2_tDX1IRYU',
      );

    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    describe('can compile', () => {
      test('then it should compile', () => {
        expect(jwtGuard).toBeDefined();
      });
    });

    describe('when token is provided', () => {
      let request: Request;
      let context: ExecutionContext;
      let result: boolean;
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
        result = await jwtGuard.canActivate(context);
      });

      test('then it should call jwtService', () => {
        expect(jwtService.verifyAsync).toBeCalledWith(testTeacherToken(), {
          secret: process.env.JWT_SECRET,
        });
      });
      test('then it should return true', () => {
        expect(result).toEqual(true);
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

      test('then it should throw an error', async () => {
        await expect(jwtGuard.canActivate(context)).rejects.toThrowError();
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
        await expect(jwtGuard.canActivate(context)).rejects.toThrowError();
      });
    });

    describe('when role is not teacher', () => {
      let request: Request;
      let context: ExecutionContext;
      beforeEach(async () => {
        request = {
          headers: {
            authorization: 'Bearer ' + testInvalidToken(),
          },
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
      });

      test('then it should give error with message should be Invalid Role', async () => {
        await expect(jwtGuard.canActivate(context)).rejects.toThrowError(
          'Invalid Role',
        );
      });
    });
  });
});
