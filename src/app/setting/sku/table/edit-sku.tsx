import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import toast from 'react-hot-toast';

export const maxDuration = 60;

type Props = { 
  sku: any; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
};

export function EditSKU({ sku, isOpen, onOpenChange }: Props) {
  const { user } = useUser(); // Clerk user object
  const username = user?.username; // Username
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (sku) {
      setCategoryName(sku.category_name);
      setDescription(sku.description);
    }
  }, [sku]);

  async function editSKU(data: { category_name: string; description: string; modified_by: string | null | undefined; }) {
    setLoading(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/api/sku`, data,
                                        {
                                          params:{
                                            id: sku.id
                                          }
                                        })
                                  .then(()=> {
                                    setLoading(false);
                                    toast.success('Success Edit SKU!');
                                  })
                                  .finally(()=>{
                                    onOpenChange(false); // Close the sheet after successful edit
                                    location.reload(); // Optionally reload the page
                                  });
    } catch (error) {
      setLoading(false);
      console.error('Error editing SKU:', error);
      toast.error('Failed to edit SKU');
    }
  }

  const handleSave = async () => {
    const data = {
      category_name: categoryName,
      description,
      modified_by: username,
    };
    await editSKU(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit SKU</SheetTitle>
          <SheetDescription>
            Make changes to your SKU settings here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryName" className="text-right">
              SKU
            </Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          {isLoading ? (
            <Button disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
          ) : (
            <Button className="text-white" type="button" onClick={handleSave}>Save changes</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
