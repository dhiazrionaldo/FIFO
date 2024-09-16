import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import axios from "axios"
import React, { useState } from 'react'
import toast from "react-hot-toast";


export const maxDuration = 60;

type Props = {id: string};

export function DeleteStockIn({id}: Props){
    const [isLoading, setLoading] = React.useState(false);
    
     async function deleteSKU(){
        setLoading(true)
        try {
            toast.error('belum bisa delete!')
            setLoading(false);
            // const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/api/sku`, {
            //                                 params:{
            //                                     id: id
            //                                 }
            //                             })
            //                             .then(() => {
            //                                 setLoading(false)
            //                             })
            //                             .finally(()=>{
            //                                 toast.success('Success Delete SKU!')
            //                                 location.reload();
            //                             });
        } catch (error) {
            console.log(error)
        }
    }
    return(
        <>
            {isLoading ? (
                <Button disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
            ):(
                <Button className="text-white" variant="ghost" onClick={deleteSKU}><Trash2 className="mr-2" size={18} color="#cf0202"/>Delete</Button>
            )}
        </>
    )
}