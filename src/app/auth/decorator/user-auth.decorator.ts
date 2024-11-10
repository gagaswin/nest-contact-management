import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/app/user/entities/user.entity';

interface RequestUser extends Request {
  user: User;
}

export const UserAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request: RequestUser = ctx.switchToHttp().getRequest<RequestUser>();
    if (request.user) return request.user;
    else throw new UnauthorizedException('Unauthorized');
  },
);
