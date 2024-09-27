/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, PackageOpen, Pencil, Trash2 } from "lucide-react"
import{Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { EditLoungeOrder } from "./edit-stockIn"
import { DeleteStockIn } from "./delete-stockIn"
import { EditStockOut } from "./edit-stockOut"
import { Badge } from '@/components/ui/badge';

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
}

export const columns: ColumnDef<stockIn>[] = [
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
    accessorKey: "category_name",
    header: "Category",
  },
  {
    accessorKey: "kode_sku",
    header: "SKU Code",
  },
  {
    accessorKey: "opening_balance",
    header: "Opening Balance",
  },
  {
    accessorKey: "qty",
    header: "Qty",
  },
  {
    accessorKey: "closing_balance",
    header: "Closing Balance",
  },
  {
    accessorKey: "unit_price",
    header: "Unit Price",
    cell: ({row}) =>{
      const formattedCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(row.original.unit_price);
      
      return <span>{formattedCurrency}</span>;
    }
  },
  {
    accessorKey: "total_price",
    header: "Total Price",
    cell: ({row}) =>{
      const formattedCurrency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(row.original.total_price);
      
      return <span>{formattedCurrency}</span>;
    }
  },
  {
    accessorKey: "date_in",
    header: ({column}) =>{
      return(
          <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}>
              Transaction Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
      )
    },
    cell: ({row}) =>{
      const dateValue = row.getValue('date_in');


      const date = new Date(row.getValue('date_in'));

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
  // {
  //   accessorKey: "created_by",
  //   header: "Created By",
  // },
  // {
  //   accessorKey: "created_datetime",
  //   header: "Created Date",
  //   cell: ({row}) =>{
  //       const date = new Date(row.getValue('created_datetime'));
  //       const formattedDate = date.toLocaleDateString('en-GB', {
  //                                   day: '2-digit',
  //                                   month: 'long',
  //                                   year: 'numeric',
  //                                   }).replace(/ /g, ' ');
  //       return <div>{formattedDate}</div>
  //   }
  // },
  {
    accessorKey: "modified_by",
    header: "Modified By",
  },
  {
    accessorKey: "modified_datetime",
    header: "Modified Date",
    cell: ({row}) =>{
      const date = new Date(row.getValue('modified_datetime'));

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
    id: "actions",
    cell: ({ row }) => {
      const stockIns = row.original
      const [isSheetOpen, setSheetOpen] = useState(false);
      const [isSheetOpenStockOut, setSheetOpenStockOut] = useState(false);
 
      return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setSheetOpen(true)}>
                <Pencil className="mr-2" size={18} />Edit
            </DropdownMenuItem>
            {/* <DropdownMenuItem onSelect={() => setSheetOpenStockOut(true)}>
                <PackageOpen className="mr-2" size={18} />Stock Out
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem><DeleteStockIn id={stockIns.id} /></DropdownMenuItem> */}
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(stockIns.id)}>
                Copy Stock In ID
            </DropdownMenuItem> */}
            </DropdownMenuContent>
            <EditLoungeOrder stockIns={stockIns} selectedItemId={stockIns.item_id}  isOpen={isSheetOpen} onOpenChange={setSheetOpen} />
            {/* <EditStockOut stockIns={stockIns} isOpen={isSheetOpenStockOut} onOpenChange={setSheetOpenStockOut} /> */}
        </DropdownMenu>
      )
    },
  },
]
