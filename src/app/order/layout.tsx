import {Sidebar} from "@/components/sidebar"
import { Toaster } from "react-hot-toast";
import { SelectedRowProvider } from "@/app/order/selected-row-provider";

export default function HomeLayout({children} : {children: React.ReactNode}){
    return(
        <main className="mx-5 mt-16 sm:ml-[300px] sm:mt-3">
            <Toaster />
            <Sidebar />
            <SelectedRowProvider>
                {children}
            </SelectedRowProvider>
        </main>
    );
}