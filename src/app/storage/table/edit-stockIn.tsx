import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

type Props = { 
  stockIns: any; 
  isOpen: boolean; 
  selectedItemId: string;
  onOpenChange: (open: boolean) => void;
};

interface ITEM {
  id: string;
  kode_sku: string;
  item_name: string;
  price: string;
  storage_minimum_stock: string;
}

export function EditStockIn({ stockIns, selectedItemId, isOpen, onOpenChange }: Props) {
  const { user } = useUser(); // Clerk user object
  const username = user?.username; 
  const [item_id, setItemid] = useState(stockIns?.item_id || '');
  const [qty, setQty] = useState(stockIns?.qty || '');
  const [kode_sku, setKodeSku] = useState('');
  const [price, setPrice] = useState('');
  const [unit_price, setUnitPrice] = useState('');
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
      return response.data.result?.[0];
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      setLoading(false);
      return null;
    }
  }

  async function EditStockIn(data: { item_id: string; qty: string; modified_by: string }) {
    setLoading(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/storage`, data, {
        params: {
          id: stockIns.id,
        },
      });
      toast.success('Success Edit Stock!');
      window.location.reload();
    } catch (error) {
      toast.error('Error Editing Stock!')
      console.error('Error editing stock:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    const data = {
      item_id: item_id,
      qty: qty,
      modified_by: username!,
      price: unit_price
    };
    await EditStockIn(data);
  };

  // Fetch item list on mount
  useEffect(() => {
    async function fetchItemList() {
      const items = await getItemList();
      setItemList(items);
    }
    fetchItemList();
  }, []);
  
  // Fetch selected item details when item_id changes
  useEffect(() => {
    async function fetchSelectedItem() {
      
    if (item_id) {
        const selectedItem = await getItemById(item_id);
        if (selectedItem) {
          setKodeSku(selectedItem.kode_sku);
          setUnitPrice(selectedItem.price);
          setPrice(
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(parseInt(selectedItem.price, 10))
          );
          setStorageMinimumStock(selectedItem.storage_minimum_stock);
        }
      }
    }
    if(stockIns){
      setItemid(stockIns.item_id);
      setQty(stockIns.qty);
    }
    fetchSelectedItem();
  }, [item_id]);

  
  
  const handleItemChange = async (itemId: string) => {
    setItemid(itemId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Stock Qty</SheetTitle>
          <SheetDescription>
            Make changes to your stock data here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item_id" className="text-right">Item</Label>
            {isLoading ? (
              <Loader2 className="col-span-3 h-6 w-6 animate-spin text-center mx-auto" />
            ) : (
              <Select value={item_id} onValueChange={handleItemChange} disabled>
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
            <Label htmlFor="kode_sku" className="text-right">SKU Code</Label>
            <Input id="kode_sku" value={kode_sku} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Unit Price</Label>
            <Input id="price" value={price} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="storage_minimum_stock" className="text-right">Minimum Stock</Label>
            <Input id="storage_minimum_stock" value={storage_minimum_stock} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">Qty</Label>
            <Input
              id="qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="col-span-3"
              type="number"
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
