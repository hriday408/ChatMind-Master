import { Injectable } from '@nestjs/common';
import { Room } from '../entities/room.entity';
import { Room as RoomModel } from '@prisma/client';
import { User } from '../../shared/interfaces/chat.interface';
import { UserService } from '../user/user.service';
import { Room as RoomType } from '../entities/room.entity';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RoomService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  async addRoom(
    roomName: Room['name'],
    hostId: User['userId'],
  ): Promise<RoomModel> {
    const hostUser = await this.userService.getUserById(hostId);
    if (!hostUser) {
      throw new NotFoundException(
        'The host user with which you are attempting to create a new room does not exist',
      );
    }
    const room = await this.prismaService.room.create({
      data: {
        name: roomName,
        host: { connect: { userId: hostId } },
        users: { connect: [{ userId: hostId }] },
      },
    });

    if (!room) {
      throw new InternalServerErrorException();
    }
    return room;
  }

  async getRoomByName(roomName: Room['name']): Promise<RoomType> {
    const room = await this.prismaService.room.findUnique({
      where: {
        name: roomName,
      },
      include: {
        users: true,
        host: true,
        chats: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async addUserToRoom(
    roomName: Room['name'],
    userId: User['userId'],
  ): Promise<void> {
    const newUser = await this.userService.getUserById(userId);

    try {
      const roomDetails = await this.prismaService.room.findUnique({
        where: {
          name: roomName,
        },
      });

      if (!roomDetails) {
        await this.addRoom(roomName, newUser.userId);
      } else {
        await this.prismaService.room.update({
          where: {
            name: roomName,
          },
          data: {
            users: {
              connect: { userId: newUser.userId },
            },
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async removeUserFromAllRooms(socket_id: User['socketId']): Promise<void> {
    try {
      // Find the user to get their associated rooms (both hosted and joined)
      const user = await this.prismaService.user.findFirst({
        where: { socketId: socket_id },
      });

      if (!user) {
        return;
      }

      const user_id = user.userId;

      // Disconnect the user from all their rooms (both hosted and joined)
      await this.prismaService.user.update({
        where: { userId: user_id },
        data: {
          rooms: {
            set: [],
          },
        },
      });

      //assign new host
      await this.transferRoomOwnership(user_id);
      // Finally, delete the user
      await this.prismaService.user.delete({
        where: { userId: user_id },
      });
    } catch (error) {
      throw new ConflictException(
        'Error removing user from rooms: ' + error.message,
      );
    }
  }

  async transferRoomOwnership(userId: User['userId']): Promise<void> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { userId: userId },
        include: { hostedRooms: true },
      });

      if (!user) {
        // User doesn't exist
        return;
      }

      for (const room of user.hostedRooms) {
        // Find another user to transfer ownership to
        const newHost = await this.prismaService.user.findFirst({
          where: {
            id: { not: user.id },
            rooms: {
              some: {
                name: room.name, // Filter by the room's name
              },
            },
          }, // Exclude the current user
        });

        if (newHost) {
          // Transfer ownership by updating the room
          await this.prismaService.room.update({
            where: { id: room.id },
            data: {
              hostId: newHost.id,
            },
          });
        } else {
          // No other users to transfer ownership to
          await this.prismaService.room.delete({
            where: { id: room.id },
          });
        }
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getRooms(): Promise<RoomModel[]> {
    return await this.prismaService.room.findMany();
  }
}
