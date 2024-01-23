import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Message,
  JoinRoom,
  KickUser,
} from '../../shared/interfaces/chat.interface';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  ChatMessageSchema,
  JoinRoomSchema,
  KickUserSchema,
} from '../../shared/schemas/chat.schema';
import { UserService } from '../user/user.service';
import { ChatPoliciesGuard } from './guards/chat.guard';
import { WsThrottlerGuard } from './guards/throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { CustomExceptionFilter } from './chat.exceptionHandler';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(CustomExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private logger = new Logger('ChatGateway');

  @Throttle({ default: { limit: 10, ttl: 30000 } })
  @UseGuards(ChatPoliciesGuard<Message>, WsThrottlerGuard)
  @UsePipes(new ZodValidationPipe(ChatMessageSchema))
  @SubscribeMessage('chat')
  async handleChatEvent(
    @MessageBody()
    payload: Message,
  ): Promise<boolean> {
    this.logger.log(payload);
    const message = await this.chatService.newMessage(payload);
    this.server.to(payload.roomName).emit('chat', message);
    return true;
  }

  @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  @SubscribeMessage('join_room')
  async handleSetClientDataEvent(
    @MessageBody()
    payload: JoinRoom,
  ): Promise<boolean> {
    const userId = payload.userId;
    const socketId = payload.socketId;
    const userName = payload.userName;
    this.logger.log(`${socketId} is joining ${payload.roomName}`);

    try {
      await this.userService.getUserById(userId);
    } catch (error) {
      await this.userService.addUser({
        userId: payload.userId,
        socketId: socketId,
        userName: userName,
      });
    }

    this.server.in(socketId).socketsJoin(payload.roomName);
    await this.roomService.addUserToRoom(payload.roomName, userId);

    return true;
  }

  @UseGuards(ChatPoliciesGuard<KickUser>)
  @UsePipes(new ZodValidationPipe(KickUserSchema))
  @SubscribeMessage('kick_user')
  async handleKickUserEvent(
    @MessageBody() payload: KickUser,
  ): Promise<boolean> {
    this.logger.log(
      `${payload.userToKick.userName} is getting kicked from ${payload.roomName}`,
    );
    this.server.to(payload.roomName).emit('kick_user', payload);
    this.server.in(payload.userToKick.socketId).socketsLeave(payload.roomName);

    const kickMessage: Message = {
      userId: payload.userId,
      timeSent: Date.now().toString(),
      message: `${payload.userToKick.userName} was kicked.`,
      roomName: payload.roomName,
      eventName: 'kick_user',
    };

    await this.chatService.newMessage(kickMessage);

    this.server.to(payload.roomName).emit('chat', kickMessage);
    return true;
  }

  async handleConnection(socket: Socket): Promise<void> {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.roomService.removeUserFromAllRooms(socket.id);
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
