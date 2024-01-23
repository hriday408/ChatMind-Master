import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';
import { CaslModule } from '../casl/casl.module';
import { ThrottlerModule } from '@nestjs/throttler';

import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    RoomModule,
    UserModule,
    CaslModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}
