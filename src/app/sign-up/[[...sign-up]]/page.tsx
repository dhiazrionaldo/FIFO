import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <SignUp />
            </div>
        </div>
      </div>
    </div>
  );
}