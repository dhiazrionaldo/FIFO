import {Sidebar} from "@/components/sidebar"
import { Toaster } from "react-hot-toast";


export const maxDuration = 60;
export const fetchCache = 'force-no-store';

export default function HomeLayout({children} : {children: React.ReactNode}){
    return(
        <main className="mx-5 mt-16 sm:ml-[300px] sm:mt-3">
            <Toaster />
            <Sidebar />
            {children}
        </main>
    );
}