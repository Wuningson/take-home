import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dtos/user-login.dto';
import { FirebaseAuthGuard } from './guard/firebase-auth.guard';
import { GetUser } from './decorator/get-user';
import { StrategyUser } from './strategy/firebase-strategy.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  getUser(@GetUser() user: StrategyUser) {
    return this.authService.getUser(user);
  }
}
