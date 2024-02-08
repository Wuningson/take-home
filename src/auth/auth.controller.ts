import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dtos/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: UserLoginDto) {
    return this.authService.userLogin(dto);
  }
}
