import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {CirclePlus, Loader2} from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const maxDuration = 60;

interface SKU {
  id: string;
  category_name: string;
  description: string;
  created_by: string;
  created_datetime: string;
  modified_by: string;
  modified_datetime: string;
}

export function CreateStockMaster() {
    const { user } = useUser(); // Clerk user object
    const username = user?.username; //username
    const [item_name, setItemName] = useState('');
    const [kode_sku, setSKUCode] = useState('');
    const [category_id, setCategoryId] = useState('');    
    const [skuList, setSkuList] = useState<SKU[]>([]); 
    const [price, setPrice] = useState('');
    const [rawPrice, setRawPrice] = useState(''); //for reconverting the value before hit API
    const [storage_minimum_stock, setStorageMinimumStock] = useState('');
    const [lounge_minimum_stock, setLoungeMinimumStock] = useState('');
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
    async function createStockMaster(data: {category_id: string; item_name: string; price: string; storage_minimum_stock: string; lounge_minimum_stock: string;  created_by: string }){
        setLoading(true)
        console.log(data.price);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/item_master`, data)
                                        .then(()=>{ 
                                            setLoading(false);
                                            // window.location.reload(); 
                                        })
                                        .finally(()=>{
                                            toast.success('Success Add SKU!');
                                            location.reload();
                                        });
        } catch (error) {
            return console.log(error)
        }
    }

    const handleSave = async () => {
        const data = {
        kode_sku: kode_sku,
        item_name: item_name,
        category_id: category_id,
        price: rawPrice,
        storage_minimum_stock: storage_minimum_stock,
        lounge_minimum_stock: lounge_minimum_stock,
        created_by: username!, 
        };

        await createStockMaster(data);
    };
    
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      setRawPrice(input); // Store the raw value
  
      const formattedPrice = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
      }).format(parseInt(input, 10)); // Ensure input is parsed as an integer
  
      setPrice(formattedPrice);
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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button  className="text-white"><CirclePlus className="mr-2" />Add new</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create new Stock Master</SheetTitle>
          <SheetDescription>
            Make changes to your stock master settings here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category_id" className="text-right">
              Item Category
            </Label>
            {isLoading ? (
              <Loader2 className="col-span-3 h-6 w-6 animate-spin text-center mx-auto" />
            ):(
              <Select
                  value={category_id}
                  onValueChange={setCategoryId} 
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode_sku" className="text-right">
              SKU Code
            </Label>
            <Input id="kode_sku" 
                   value={kode_sku}
                   onChange={(e) => setSKUCode(e.target.value)} 
                   className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Unit Price
            </Label>
            <Input 
              id="price" 
              value={price}
              onChange={handlePriceChange}
              className="col-span-3" 
              type="text" // Use text to allow currency formatting
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="storage_minimum_stock" className="text-right">
              Storage Minimum Stock
            </Label>
            <Input id="storage_minimum_stock" 
              value={storage_minimum_stock}
              onChange={(e) => setStorageMinimumStock(e.target.value)}
              className="col-span-3" 
              type='number'
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lounge_minimum_stock" className="text-right">
              Lounge Minimum Stock
            </Label>
            <Input id="lounge_minimum_stock" 
              value={lounge_minimum_stock}
              onChange={(e) => setLoungeMinimumStock(e.target.value)}
              className="col-span-3" 
              type='number'
            />
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
