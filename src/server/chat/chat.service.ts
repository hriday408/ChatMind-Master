import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Message } from 'src/shared/interfaces/chat.interface';

@Injectable()
export class ChatService {
  constructor(private prismaService: PrismaService) {}

  async newMessage(messageData: Message): Promise<Message> {
    try {
      const message = await this.prismaService.chat.create({
        data: {
          eventName: messageData.eventName,
          user: { connect: { userId: messageData.userId } },
          timeSent: messageData.timeSent,
          message: messageData.message,
          room: {
            connect: {
              name: messageData.roomName,
            },
          },
        },

        include: {
          user: true,
        },
      });

      return message;
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
