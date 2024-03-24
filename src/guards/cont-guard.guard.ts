import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import {
  ExamController,
  ExamControllerDocument,
} from '../schemas/exam-controller.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExamContGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(ExamController.name)
    private examControllerModel: Model<ExamControllerDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(
        {
          message: 'Token Not Provided',
        },
        401,
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      if (payload?.role !== 'exam-controller') {
        throw new HttpException(
          {
            message: 'Invalid Role',
          },
          403,
        );
      }
      const user = await this.examControllerModel.findById(payload.id);
      if (!user) {
        throw new HttpException(
          {
            message: 'Invalid User',
          },
          401,
        );
      }
      request['user'] = payload;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // console.log(err.message);
      throw new HttpException(
        {
          message: 'Invalid Token',
        },
        401,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
