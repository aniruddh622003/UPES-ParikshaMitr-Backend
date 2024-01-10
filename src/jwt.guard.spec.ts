import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { testToken } from '../test/stubs/jwt.stub';

jest.mock('@nestjs/jwt');

describe('JwtGuard', () => {
  let jwtGuard: JwtGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtGuard, JwtService],
    }).compile();

    jwtGuard = module.get<JwtGuard>(JwtGuard);
    jwtService = module.get<JwtService>(JwtService);
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
            authorization: 'Bearer ' + testToken(),
          },
        } as any;
        context = {
          switchToHttp: () => ({
            getRequest: () => request,
          }),
        } as any;
        jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
          id: 'id',
          sap_id: 'sap_id',
          name: 'name',
        });
        result = await jwtGuard.canActivate(context);
      });

      test('then it should call jwtService', () => {
        expect(jwtService.verifyAsync).toBeCalledWith(testToken(), {
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
  });
});
