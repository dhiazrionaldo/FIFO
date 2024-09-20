"use client"
import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDownCircle, MoreHorizontal, PackageOpen, Pencil, Trash2 } from "lucide-react"
import{Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { TableBody, TableRow } from '@/components/ui/table';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import toast from 'react-hot-toast';

export const maxDuration = 60;

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type stockIn = {
  id: string
  item_id: string
  sku_category_id: string
  item_name: string
  category_name: string
  qty: string
  unit_price: number
  total_price: number
  date_in: string
  created_by: string
  created_datetime: string
  modified_by: string
  modified_datetime: string
  kode_sku: string
}

export const columns: ColumnDef<stockIn>[] = [  
  {
    header: "Action",
    cell: ({row}) => {
      return (
        
        <CollapsibleTrigger asChild><Button className='text-white' variant='ghost'><ChevronDownCircle className='w-5 h-5'/></Button></CollapsibleTrigger>
      )
    }
  },
  {
    accessorKey: "kode_sku",
    header: "SKU Code",
  }, 
  {
    accessorKey: "item_name",
    header: ({column}) =>{
        return(
            <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}>
                Item Name

                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
    },
  },
  {
    accessorKey: "transaction_date",
    header: ({column}) =>{
      return(
          <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "desc")}>
              Transaction Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      )
    },
    cell: ({row}) =>{
      const dateValue = row.getValue('transaction_date');


      const date = new Date(row.getValue('transaction_date'));

      // Define an array of month abbreviations
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // Extract day, month, and year
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = monthNames[date.getUTCMonth()]; // Get month abbreviation
      const year = date.getUTCFullYear();

      // Format as dd mm yyyy
      const formattedDate = `${day} ${month} ${year}`;

      return <div>{formattedDate}</div>
    }
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction Type",
    cell:({row}) => {
      const status = new String(row.getValue('transaction_type'))
      
      if(status == 'DELIVER TO LOUNGE'){
        return <div><Badge className='text-white bg-green-700'>{status}</Badge></div>
      } else if(status =='LOUNGE ORDER'){
        return <div><Badge className='text-white bg-yellow-500'>{status}</Badge></div>
      }
      else{
        return <div><Badge className='text-white'>{status}</Badge></div>
      }
    }
  },  
  {
    accessorKey: "before_qty",
    header: "Before Qty",
  },
  {
    accessorKey: "transaction_qty",
    header: "Transaction Qty",
  },
  {
    accessorKey: "storage_qty",
    header: "Storage Qty",
  },
  {
    accessorKey: "order_qty",
    header: "Order Qty",
  },
  {
    accessorKey: "lounge_qty",
    header: "Lounge Qty",
  },
  {
    accessorKey: "modified_by",
    header: "Modified By",
  },
  // {
  //   accessorKey: "modified_datetime",
  //   header: "Modified Date",
  //   cell: ({row}) =>{
  //     const dateValue = row.getValue('modified_datetime');


  //     const date = new Date(row.getValue('modified_datetime'));

  //     // Define an array of month abbreviations
  //     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  //     // Extract day, month, and year
  //     const day = String(date.getUTCDate()).padStart(2, '0');
  //     const month = monthNames[date.getUTCMonth()]; // Get month abbreviation
  //     const year = date.getUTCFullYear();

  //     // Format as dd mm yyyy
  //     const formattedDate = `${day} ${month} ${year}`;

  //     return <div>{formattedDate}</div>
  //   }
  // },
]
