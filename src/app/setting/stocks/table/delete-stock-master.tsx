import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import axios from "axios"
import React, { useState } from 'react'
import toast from "react-hot-toast";

export const maxDuration = 60;

type Props = {id: string};

export function DeleteStockMaster({id}: Props){
    const [isLoading, setLoading] = React.useState(false);
    
     async function deleteSKU(){
        setLoading(true)
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/api/item_master`, {
                                            params:{
                                                id: id
                                            }
                                        })
                                        .then(() => {
                                            setLoading(false)
                                            toast.success('Data Deleted !')
                                        })
                                        .catch((err) => {
                                            setLoading(false)
                                            toast.error('Error :', err)
                                            console.log(err)
                                        })
                                        .finally(()=>{
                                            toast.success('Success Delete Item Master!')
                                            location.reload();
                                        });
            console.log(response);
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