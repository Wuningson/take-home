import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '../../users/schemas/user.entity';
import { Request } from 'express';
import { StrategyUser } from '../strategy/firebase-strategy.guard';

export interface RequestWithUser extends Request {
  user: StrategyUser;
}

function RoleGuard(...roles: Role[]): Type<CanActivate> {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return roles.includes(user.role);
    }
  }

  return mixin(RoleGuardMixin);
}

export default RoleGuard;
