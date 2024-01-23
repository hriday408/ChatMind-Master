import React from 'react';
import { Message, User } from '../../shared/interfaces/chat.interface';
export type ClientMessage = Message & { delivered: boolean };

const determineMessageStyle = (
  user: Pick<User, 'userId' | 'userName'>,
  messageUserId: string,
  eventType: string,
) => {
  if (eventType === 'kick_user') {
    return {
      message:
        'bg-transparent text-white flex justify-center underline underline-offset-4 text-sm',
    };
  }
  if (user && messageUserId === user.userId) {
    return {
      message: 'bg-slate-500 p-5 ml-24 mr-2 rounded-2xl break-words',
      sender: 'ml-24 pl-4',
    };
  } else {
    return {
      message: 'bg-slate-800 p-5 mr-24 rounded-2xl break-words',
      sender: 'mr-24 pl-4',
    };
  }
};

export const Messages = ({
  user,
  messages,
}: {
  user: Pick<User, 'userId' | 'userName'>;
  messages: ClientMessage[];
}) => {
  return (
    <div className="flex h-4/6 w-full flex-col-reverse overflow-y-scroll">
      {messages?.map((message, index) => {
        return (
          <div key={index + Number(message.timeSent)} className="mb-4">
            {message.eventName === 'chat' && (
              <div
                className={
                  determineMessageStyle(user, message.userId, message.eventName)
                    .sender
                }
              >
                <span className="text-sm text-gray-400">
                  {message.user?.userName}
                </span>
                <span className="text-sm text-gray-400">{' ' + '•' + ' '}</span>
                <span className="text-sm text-gray-400">
                  {new Date(Number(message.timeSent)).toLocaleString('en-US')}
                </span>
              </div>
            )}
            <div
              className={
                determineMessageStyle(user, message.userId, message.eventName)
                  .message
              }
            >
              <p className="text-white">{message.message}</p>
            </div>
            {message.eventName === 'chat' &&
              user &&
              message.userId === user.userId && (
                <p className="text-right text-xs text-gray-400 px-4">
                  {message.delivered ? 'Delivered' : 'Not delivered'}
                </p>
              )}
          </div>
        );
      })}
    </div>
  );
};
