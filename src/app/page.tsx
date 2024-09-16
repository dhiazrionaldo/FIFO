import Image from "next/image";
import { UserButton} from "@clerk/nextjs";
import jasLogo from '../asset/jas - white.png';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, LogIn } from "lucide-react";
import {auth} from "@clerk/nextjs/server"

export default async function Home() {

  const {userId} = await auth();
  const isAuth = !!userId

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-700 via-gray-900 to-black">
      <div className="flex flex-col pl-3 pt-3 text-white">
        <Image src={jasLogo} width={120} height={120} alt="jas logo white"/>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold text-white">Wellcome to <b>FIFO</b></h1>
            <UserButton afterSignOutUrl="/"/>
          </div>
          <p className="max-w-xl mt-1 text-lg text-white">
            Inventory Management System
          </p>
          <div className="flex flex-row items-center text-center">
            <div className="flex mt-2">
              {isAuth ? (
                  <>
                    <Link href={`/home`}>
                        <Button className="text-white">
                          Go to app <ArrowRight className="ml-2" />
                        </Button>

                        {/* <Button disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait ...
                        </Button> */}
                      </Link>
                  </>
                ):(
                  <Link href="/sign-in" className="ml-5 mt-5 text-white">
                    <Button className="text-white">Login to Continue<LogIn className="w-4 h-4 ml-2" /></Button>
                  </Link>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
