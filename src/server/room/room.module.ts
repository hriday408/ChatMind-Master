import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [UserModule, CaslModule],
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
  exports: [RoomService],
})
export class RoomModule {}
