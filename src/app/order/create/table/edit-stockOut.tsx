import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {CalendarClock, CirclePlus, Loader2} from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import axios from 'axios'
import {useUser} from '@clerk/nextjs'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import toast from 'react-hot-toast'

export const maxDuration = 60;

type Props = { 
  stockIns: any; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
};


interface SKU {
  id: string;
  category_name: string;
  description: string;
  created_by: string;
  created_datetime: string;
  modified_by: string;
  modified_datetime: string;
}

export function EditStockOut({ stockIns, isOpen, onOpenChange }: Props) {
    const { user } = useUser(); // Clerk user object
    const username = user?.username; //username
    const [sku_category_id, setSkuCategoryId] = useState('');
    const [item_name, setItemName] = useState('');
    const [qty, setQty] = useState('');
    const [date_in, setDateIn] = useState(new Date());
    const [time_in, setTimeIn] = useState(format(new Date(), 'HH:mm'));
    const [skuList, setSkuList] = useState<SKU[]>([]); 
    const [isLoading, setLoading] = React.useState(false);
    
    async function getSKUList() {
      setLoading(true)
      try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/sku`);
          setLoading(false)
          return response.data.items; // Expecting an array of SKUs with id and category_name
      } catch (error) {
          console.error('Error fetching SKU list:', error);
          return [];
      }
    }
    async function EditStockOut(data: { sku_category_id: string; item_name: string; qty: string; date_in: string; modified_by: string }){
        setLoading(true)
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/stockOut`, data,
                                          {
                                            params: {
                                              id: stockIns.id
                                            }
                                          }
                                        )
                                        .then(()=>{ 
                                            setLoading(false);
                                            window.location.reload(); 
                                        })
                                        .finally(()=>{
                                            toast.success('Success Edit Stock!');
                                            location.reload();
                                        });
        } catch (error) {
            return console.log(error)
        }
    }

    const handleSave = async () => {
      const selectedDateTime = new Date(date_in);
      const [hours, minutes] = time_in.split(':');
      selectedDateTime.setHours(parseInt(hours, 10));
      selectedDateTime.setMinutes(parseInt(minutes, 10));

      // Convert selectedDateTime to a string in "yyyy-MM-dd HH:mm:ss" format
      const datetimeFormatted = format(selectedDateTime, 'yyyy-MM-dd HH:mm:ss');

        const data = {
          sku_category_id: sku_category_id,
          item_name: item_name,
          qty: qty,
          date_in: datetimeFormatted,
          modified_by: username!, 
        };

        await EditStockOut(data);
    };

    useEffect(() => {
        async function fetchSKUList() {
            const skus = await getSKUList();
            if (Array.isArray(skus)) {
                setSkuList(skus);
            } else {
                console.error("API response is not an array:", skus);
                setSkuList([]); // Ensure skuList is always an array
            }
        }
        fetchSKUList();
    }, []);

    useEffect(() => {
      if (stockIns) {
        setSkuCategoryId(stockIns.sku_category_id);
        setItemName(stockIns.item_name);
        setQty(stockIns.qty);
        const parsedDate = parseISO(stockIns.date_in);
        setDateIn(parsedDate);
        const timeRegex = /T(\d{2}:\d{2})/;
        // const dateObj = parseISO(stockIns.date_in);
        
        // Format time in UTC
        const timeInUTC = stockIns.date_in.match(timeRegex);
        if (timeInUTC) {
          const timeIn = timeInUTC[1]; // Extracted time part
          setTimeIn(timeIn);
        } else {
          console.log('Time not found');
        }
        // setTimeIn(format(parsedDate, 'HH:mm'));
      }
    }, [stockIns]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Stock Out</SheetTitle>
          <SheetDescription>
            Make changes to your stock data here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku_category_id" className="text-right">
              SKU
            </Label>
            {isLoading ? (
              <Loader2 className="col-span-3 h-6 w-6 animate-spin text-center mx-auto" />
            ):(
              <Select
                  value={sku_category_id}
                  onValueChange={setSkuCategoryId} 
                  disabled
              >
                  <SelectTrigger className="col-span-3" >
                      <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                      {skuList.map((sku) => (
                          <SelectItem key={sku.id} value={sku.id}>
                              {sku.category_name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item_name" className="text-right">
              Item Name
            </Label>
            <Input id="item_name" 
                   value={item_name}
                   onChange={(e) => setItemName(e.target.value)}
                   className="col-span-3" 
                   disabled/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Qty
            </Label>
            <Input id="qty" 
                   value={qty}
                   onChange={(e) => setQty(e.target.value)}
                   className="col-span-3"
                   type='number' />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date_in" className="text-right">
                Date In
            </Label>
            <div className="col-span-3 flex space-x-2">
                <Popover>
                    <PopoverTrigger asChild>
                      <div className= "flex h-10 items-center rounded-md border border-input pl-3 text-sm ">
                        <CalendarClock className="h-[15px] w-[15px]" />
                        <Input 
                            id="date_in" 
                            value={format(date_in, 'yyyy-MM-dd')}
                            className="w-full h-fit border-none"
                            readOnly
                            disabled
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar 
                            selected={date_in} 
                            onSelect={(day) => {
                              if (day) {
                                  setDateIn(day); // Only update state if day is not undefined
                              }
                            }} 
                            mode="single"
                            disabled
                        />
                    </PopoverContent>
                </Popover>
                <Input 
                    id="time_in"
                    value={time_in}
                    onChange={(e) => setTimeIn(e.target.value)}
                    type="time"
                    className="w-1/3"
                    disabled
                />
            </div>
          </div>

        </div>
        <SheetFooter>
          {/* <SheetClose asChild> */}
            <>
                {isLoading ? (
                    <Button disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
                ):(
                    <Button className="text-white" type="submit" onClick={handleSave}>Save changes</Button>
                )}
            </>
          {/* </SheetClose> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
