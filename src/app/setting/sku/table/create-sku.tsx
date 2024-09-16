import React, { useState } from 'react'
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

export const maxDuration = 60;

export function CreateSKU() {
    const { user } = useUser(); // Clerk user object
    const username = user?.username; //username
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setLoading] = React.useState(false);
    
    async function createSKU(data: { category_name: string; description: string; created_by: string }){
        setLoading(true)
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/sku`, data)
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
        category_name: categoryName,
        description,
        created_by: username!, 
        };

        await createSKU(data);
    };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button  className="text-white"><CirclePlus className="mr-2" />Add new</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create new Item Category</SheetTitle>
          <SheetDescription>
            Make changes to your sku settings here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryName" className="text-right">
              Category Name
            </Label>
            <Input id="categoryName" 
                   value={categoryName}
                   onChange={(e) => setCategoryName(e.target.value)} 
                   className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="col-span-3" />
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
