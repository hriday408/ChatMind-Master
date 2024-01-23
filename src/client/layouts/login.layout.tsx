import React from 'react';
import { LoginHeader } from '../components/login.header';
export const LoginLayout = ({
  children,
}: {
  children: React.ReactElement[];
}) => {
  return (
    <div className="mx-auto flex-col h-screen w-screen justify-center bg-gray-900">
      <LoginHeader />

      <div className="flex w-full items-center justify-center">
        <div className="my-auto flex h-127 w-127 flex-col p-2 md:flex-row">
          {children}
        </div>
      </div>
    </div>
  );
};
