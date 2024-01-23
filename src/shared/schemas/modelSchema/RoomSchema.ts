import { z } from 'zod';

import { RoomNameSchema } from '../utils.schema';
import { ChatOptionalDefaultsSchema } from './ChatSchema';
import { UserOptionalDefaultsSchema } from './UserSchema';

/////////////////////////////////////////
// ROOM SCHEMA
/////////////////////////////////////////

export const RoomSchema = z.object({
  id: z.number().int(),
  name: RoomNameSchema,
  hostId: z.number().int(),
  host: UserOptionalDefaultsSchema.optional(),
  users: UserOptionalDefaultsSchema.array().optional(),
  chats: ChatOptionalDefaultsSchema.array().optional(),
});
export type Room = z.infer<typeof RoomSchema>;

/////////////////////////////////////////
// ROOM OPTIONAL DEFAULTS SCHEMA
/////////////////////////////////////////

export const RoomOptionalDefaultsSchema = RoomSchema.merge(
  z.object({
    id: z.number().int().optional(),
  }),
);

export type RoomOptionalDefaults = z.infer<typeof RoomOptionalDefaultsSchema>;

export default RoomSchema;
