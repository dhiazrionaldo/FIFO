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
import { DataTable } from "@/app/lounge/create/table/data-table";
import axios from "axios";
import { columns } from "@/app/lounge/create/table/columns";
import { Loader2, SaveIcon } from "lucide-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export function StorageDrawerDialog() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="md:w-auto">Choose Data</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[100rem]">
          <DialogHeader>
            <DialogTitle>Storage Data</DialogTitle>
            <DialogDescription>
              Choose storage item to order here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <StorageData />
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
          <DrawerTitle>Storage Data</DrawerTitle>
          <DrawerDescription>
          Choose storage item to order here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <StorageData className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button className="text-white" variant="outline">SAVE</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function StorageData({ className }: React.ComponentProps<"form">) {
    const [data, setData] = React.useState<any[]>([]); 
    const [loading, setLoading] = React.useState(false); 

  // Function to fetch data based on selected date range
    const getAllStorageData = async () => {
        
        setLoading(true);
        try {
        

        // API call to get stock data
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/order/getAllStorageData`);
        setData(res.data.items);
        } catch (error) {
        console.error("Error fetching data:", error);
        } finally {
        setLoading(false);
        }
    };
    
    React.useEffect(()=>{
        getAllStorageData();
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
