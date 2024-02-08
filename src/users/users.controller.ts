import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { FirebaseAuthGuard } from '../auth/guard/firebase-auth.guard';
import RoleGuard from '../auth/guard/role.guard';
import { Role } from './schemas/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @HttpCode(201)
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @HttpCode(200)
  @Put('/:id')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(RoleGuard(Role.ADMIN))
  @UseGuards(FirebaseAuthGuard)
  uploadUserImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|gif|bmp|webp|svg\+xml)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: number,
  ) {
    return this.userService.uploadUserImage(id, file);
  }
}
