import { z } from 'zod';
import { SocketIdSchema, UserIdSchema, UserNameSchema } from '../utils.schema';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.number().int(),
  userId: UserIdSchema,
  userName: UserNameSchema,
  socketId: SocketIdSchema,
});
/////////////////////////////////////////

export const UserOptionalDefaultsSchema = UserSchema.merge(
  z.object({
    id: z.number().int().optional(),
  }),
);

export type UserOptionalDefaults = z.infer<typeof UserOptionalDefaultsSchema>;

export default UserSchema;
