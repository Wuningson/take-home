import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../guard/role.guard';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
