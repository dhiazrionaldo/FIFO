import {Sidebar} from "@/components/sidebar";
import { Toaster } from "react-hot-toast";
import { SelectedRowProvider } from "@/app/storage/selected-row-provider";

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