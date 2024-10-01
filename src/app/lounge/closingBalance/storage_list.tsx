"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "usehooks-ts"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/app/lounge/openingBalance/table/data-table";
import axios from "axios";
import { columns } from "@/app/lounge/openingBalance/table/columns";
import { Loader2, SaveIcon } from "lucide-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";


export const fetchCache = 'force-no-store';
export const maxDuration = 60;

export function LoungeDrawerDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="md:w-auto max-w-[150px]">Choose Data</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[100rem]">
          <DialogHeader>
            <DialogTitle>Lounge Data</DialogTitle>
            <DialogDescription>
              Choose Lounge item here. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <LoungeData />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full" variant="outline">Choose Data</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Lounge Data</DrawerTitle>
          <DrawerDescription>
          Choose lounge item to order here. Click save when you are done.
          </DrawerDescription>
        </DrawerHeader>
        <LoungeData className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button className="text-white" variant="outline">SAVE</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function LoungeData({ className }: React.ComponentProps<"form">) {
    const [data, setData] = React.useState<any[]>([]); 
    const [loading, setLoading] = React.useState(false); 

  // Function to fetch data based on selected date range
    const getAllLoungeData = async () => {
        
        setLoading(true);
        try {
        

        // API call to get stock data
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/lounge/getAllLoungeData`);
        setData(res.data.items);
        } catch (error) {
        console.error("Error fetching data:", error);
        } finally {
        setLoading(false);
        }
    };
    
    React.useEffect(()=>{
      getAllLoungeData();
    },[]);

  
  return (
    <>
        {loading ? (
            <Loader2 className='col-span-3 h-10 w-10 text-blue-600 animate-spin mx-auto' />
        ) : (
            <div className="flex flex-col">
                <DataTable data={data} columns={columns}  />
            </div>
        )}
    </>
  )
}
