import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { FirebaseAdminService } from '../../firebase/firebase-admin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../../users/schemas/user.entity';
import { Repository } from 'typeorm';

export interface StrategyUser {
  email: string;
  role: Role;
}

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-auth',
) {
  constructor(
    private firebaseAdminService: FirebaseAdminService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(token: string): Promise<StrategyUser> {
    const firebaseUser = await this.firebaseAdminService.verifyToken(token);
    if (!firebaseUser) {
      throw new UnauthorizedException('invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: { email: firebaseUser.email },
    });
    if (!user) {
      throw new UnauthorizedException('invalid or expired token');
    }

    return {
      email: firebaseUser.email,
      role: user.role,
    };
  }
}
