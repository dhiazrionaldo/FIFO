import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CirclePlus, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import toast from 'react-hot-toast';

export const maxDuration = 60;

interface SKU {
  id: string;
  kode_sku: string;
  item_name: string;
  category_id: string;
  category_name: string;
  price: string;
  storage_minimum_stock: string;
  lounge_minimum_stock: string;
  created_by: string;
  created_datetime: string;
  modified_by: string;
  modified_datetime: string;
}

interface ITEM {
  id: string;
  kode_sku: string;
  item_name: string;
  category_id: string;
  category_name: string;
  price: string;
  storage_minimum_stock: string;
  lounge_minimum_stock: string;
  created_by: string;
  created_datetime: string;
  modified_by: string;
  modified_datetime: string;
}

export function CreateStockIn() {
  const { user } = useUser();
  const username = user?.username;
  const [item_id, setItemid] = useState('');
  const [qty, setQty] = useState('');
  const [kode_sku, setKodeSku] = useState('');
  const [price, setPrice] = useState('');
  const [storage_minimum_stock, setStorageMinimumStock] = useState('');
  const [itemList, setItemList] = useState<ITEM[]>([]);
  const [isLoading, setLoading] = useState(false);

  async function getItemList() {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/item_master`);
      setLoading(false);
      return response.data.items;
    } catch (error) {
      console.error('Error fetching item master list:', error);
      setLoading(false);
      return [];
    }
  }

  async function getItemById(itemId: string) {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/item_master/${itemId}`);
      setLoading(false);
      console.log(response.data.result)
      return response.data.result?.[0]; // Assuming the response returns an array
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      setLoading(false);
      return null;
    }
  }

  const handleItemChange = async (itemId: string) => {
    setItemid(itemId);
    const selectedItem = await getItemById(itemId);
    
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
  }).format(parseInt(selectedItem.price, 10)); // Ensure input is parsed as an integer

    if (selectedItem) {
      setKodeSku(selectedItem.kode_sku);
      setPrice(formattedPrice);
      setStorageMinimumStock(selectedItem.storage_minimum_stock);
    }
  };

  const handleSave = async () => {
    const data = {
      item_id: item_id,
      qty: qty,
      created_by: username!,
    };

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/order`, data);
      toast.success('Success Add Order!');
      window.location.reload();
    } catch (error) {
      toast.error('Error Add Order')
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchItemList() {
      const items = await getItemList();
      if (Array.isArray(items)) {
        setItemList(items);
      } else {
        console.error("API response is not an array:", items);
        setItemList([]);
      }
    }
    fetchItemList();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="text-white"><CirclePlus className="mr-2" />Add new Stock</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create new Stock</SheetTitle>
          <SheetDescription>
            Make changes to your stock data here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item_id" className="text-right">
              Item
            </Label>
            {isLoading ? (
              <Loader2 className="col-span-3 h-6 w-6 animate-spin text-center mx-auto" />
            ) : (
              <Select
                value={item_id}
                onValueChange={handleItemChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {itemList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode_sku" className="text-right">
              SKU Code
            </Label>
            <Input id="kode_sku" value={kode_sku} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Unit Price
            </Label>
            <Input id="price" value={price} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Minimum Stock
            </Label>
            <Input id="storage_minimum_stock" value={storage_minimum_stock} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Qty
            </Label>
            <Input
              id="qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="col-span-3"
              type='number'
            />
          </div>
        </div>
        <SheetFooter>
          {isLoading ? (
            <Button disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
          ) : (
            <Button className="text-white" type="submit" onClick={handleSave}>Save changes</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
