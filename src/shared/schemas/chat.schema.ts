import { z } from 'zod';

import { UserOptionalDefaultsSchema } from './modelSchema/UserSchema';
import { ChatOptionalDefaultsSchema } from './modelSchema/ChatSchema';
import { RoomOptionalDefaultsSchema } from './modelSchema/RoomSchema';
import {
  RoomNameSchema,
  EventNameSchema,
  UserIdSchema,
  SocketIdSchema,
  UserNameSchema,
} from './utils.schema';

export const ChatMessageSchema = ChatOptionalDefaultsSchema;
export const UserSchema = UserOptionalDefaultsSchema;
export const RoomSchema = RoomOptionalDefaultsSchema;
export const JoinRoomSchema = z.object({
  userId: UserIdSchema,
  socketId: SocketIdSchema,
  userName: UserNameSchema,
  roomName: RoomNameSchema,
  eventName: EventNameSchema,
});

export const KickUserSchema = z.object({
  userId: UserIdSchema,
  userToKick: UserSchema,
  roomName: RoomNameSchema,
  eventName: EventNameSchema,
});

export const KickUserEventAckSchema = z
  .function()
  .args(z.boolean())
  .returns(z.void());

export const KickUserEventSchema = z
  .function()
  .args(KickUserSchema, KickUserEventAckSchema)
  .returns(z.void());

export const ChatEventAckSchema = z
  .function()
  .args(z.boolean())
  .returns(z.void());

export const ChatEventSchema = z
  .function()
  .args(ChatMessageSchema, ChatEventAckSchema)
  .returns(z.void());

export const JoinRoomEventAckSchema = z
  .function()
  .args(z.string(), z.boolean())
  .returns(z.void());

export const JoinRoomEventSchema = z
  .function()
  .args(JoinRoomSchema, JoinRoomEventAckSchema)
  .returns(z.void());

export const ClientToServerEventsSchema = z.object({
  chat: z.function().args(ChatMessageSchema).returns(z.void()),
  join_room: z.function().args(JoinRoomSchema).returns(z.void()),
  kick_user: z
    .function()
    .args(KickUserSchema, z.function().args(z.boolean()).returns(z.void()))
    .returns(z.void()),
});

export const ServerToClientEventsSchema = z.object({
  chat: z.function().args(ChatMessageSchema).returns(z.void()),
  kick_user: z.function().args(KickUserSchema).returns(z.void()),
  error: z
    .function()
    .args(
      z.object({
        status: z.number(),
        message: z.string(),
      }),
    )
    .returns(z.void()),
});
