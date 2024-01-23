import { User } from '../../shared/interfaces/chat.interface';
import { v4 as uuidv4 } from 'uuid';
export const setUser = ({
  userId,
  userName,
}: Pick<User, 'userId' | 'userName'>) => {
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('userName', userName);
};

export const unsetUser = () => {
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
};

export const getUser = () => {
  const userId = sessionStorage.getItem('userId');
  const userName = sessionStorage.getItem('userName');
  return {
    userId,
    userName,
  };
};

export const generateUserId = (userName: User['userName']) => {
  return uuidv4().toString();
};
