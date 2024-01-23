import { z } from 'zod';

import { EventNameSchema } from '../utils.schema';
import {
  UserIdSchema,
  TimeSentSchema,
  MessageSchema,
  RoomNameSchema,
} from '../utils.schema';
import UserSchema, { UserOptionalDefaultsSchema } from './UserSchema';

/////////////////////////////////////////
// CHAT SCHEMA
/////////////////////////////////////////

export const ChatSchema = z.object({
  eventName: EventNameSchema,
  id: z.number().int(),
  userId: UserIdSchema,
  timeSent: TimeSentSchema,
  message: MessageSchema,
  roomName: RoomNameSchema,
  user: UserOptionalDefaultsSchema.optional(),
});

export type Chat = z.infer<typeof ChatSchema>;

/////////////////////////////////////////
// CHAT OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const ChatOptionalDefaultsSchema = ChatSchema.merge(
  z.object({
    id: z.number().int().optional(),
  }),
);

export type ChatOptionalDefaults = z.infer<typeof ChatOptionalDefaultsSchema>;

/////////////////////////////////////////

export default ChatSchema;
