import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class TeacherJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

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
      if (payload?.role !== 'teacher') {
        throw new HttpException(
          {
            message: 'Invalid Role',
          },
          403,
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
