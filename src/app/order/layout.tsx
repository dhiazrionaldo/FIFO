import {Sidebar} from "@/components/sidebar"
import { Toaster } from "react-hot-toast";
import { SelectedRowProvider } from "@/app/order/selected-row-provider";

export const fetchCache = 'force-no-store';
export const maxDuration = 60;

export default function HomeLayout({children} : {children: React.ReactNode}){
    return(
        <main className="mx-3 mt-16 sm:ml-[250px] sm:mt-3">
            <Toaster />
            <Sidebar />
            <SelectedRowProvider>
                {children}
            </SelectedRowProvider>
        </main>
    );
}