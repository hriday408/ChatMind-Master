import React from 'react';
export const LoginHeader = () => {
  return (
    <>
      <header className="flex h-1/6 flex-col w-full justify-center  pt-12">
        <div className="flex justify-center">
          <div className="flex h-8 items-center">
            <span className="ml-1 cursor-pointer text-3xl  font-bold">
              <span className="ml-1 cursor-pointer">
                <span className="text-yellow-300 text-5xl ">Chat</span>
                <span className="text-blue-300 text-4xl">Mind</span>
              </span>
            </span>
          </div>
        </div>
      </header>
    </>
  );
};
