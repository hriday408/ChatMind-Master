import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  Action,
  AppAbility,
  CaslAbilityFactory,
} from '../../casl/casl-ability.factory';
import { RoomService } from '../../room/room.service';
import { PolicyHandler } from '../../casl/interfaces/policy.interface';
import {
  ClientToServerEvents,
  UserId,
} from '../../../shared/interfaces/chat.interface';
import { Room } from 'src/server/entities/room.entity';

import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class ChatPoliciesGuard<
  CtxData extends {
    userId: UserId;
    roomName: Room['name'];
    eventName: keyof ClientToServerEvents;
  },
> implements CanActivate
{
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private roomService: RoomService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers: PolicyHandler[] = [];
    const ctx = context.switchToWs();
    const data = ctx.getData<CtxData>();

    let roomInstance: Room; // Initialize with a default value

    const room = await this.roomService.getRoomByName(data.roomName);

    roomInstance = new Room({
      name: room.name,
      hostId: room.hostId,
      users: room.users,
      host: room.host,
    });

    if (data.eventName === 'kick_user') {
      policyHandlers.push((ability) => ability.can(Action.Kick, roomInstance));
    }

    if (data.eventName === 'join_room') {
      policyHandlers.push((ability) => ability.can(Action.Join, roomInstance));
    }

    if (data.eventName === 'chat') {
      policyHandlers.push((ability) =>
        ability.can(Action.Message, roomInstance),
      );
    }

    const ability = this.caslAbilityFactory.createForUser(data.userId);

    policyHandlers.every((handler) => {
      const check = this.execPolicyHandler(handler, ability);

      if (check === false) {
        throw new ForbiddenException();
      }
    });
    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
