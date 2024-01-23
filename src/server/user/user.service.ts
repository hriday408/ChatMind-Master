import { Injectable, NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { PrismaService } from '../prisma.service';
import { User as UserModel } from '@prisma/client';
import { User } from '../entities/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async addUser(user: User) {
    try {
    
      const newUser = await this.prismaService.user.create({
        data: {
          userId: user.userId,
          userName: user.userName,
          socketId: user.socketId,
        },
      });
      return newUser;
    } catch (error) {
      throw new ConflictException('User already exists');
    }
  }

  async getAllUsers(): Promise<UserModel[]> {
    const users = await this.prismaService.user.findMany();

    return users;
  }

  async getUserById(user_id: User['userId']): Promise<UserModel> {
    const found = await this.prismaService.user.findUnique({
      where: {
        userId: user_id,
      },
    });
    if (!found) {
      throw new NotFoundException('User does not exist');
    }
    return found;
  }
}
