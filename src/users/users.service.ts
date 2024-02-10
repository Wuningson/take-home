import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseClientService } from '../firebase/firebase-client.service';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './schemas/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private firebaseClientService: FirebaseClientService,
    private firebaseAdminService: FirebaseAdminService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const { email, password } = dto;
    const check = await this.firebaseAdminService.checkIfEmailExists(email);
    if (check) {
      throw new BadRequestException('account with this email exists already');
    }

    const dbCheck = await this.userRepository.findOne({ where: { email } });
    if (dbCheck) {
      throw new BadRequestException('account with this email exists already');
    }

    const token = await this.firebaseClientService.createUser(email, password);
    if (token === false) {
      throw new BadRequestException(
        'could not create user account at this time',
      );
    }

    const user = this.userRepository.create({ email, role: Role.ADMIN });
    await this.userRepository.save(user);

    return {
      data: {
        token,
      },
      message: 'user account created successfully',
    };
  }

  async uploadUserImage(id: number, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new BadRequestException('user not found');
    }

    user.image = file.buffer;
    await this.userRepository.save(user);

    return {
      message: 'user image uploaded successfully',
    };
  }
}
