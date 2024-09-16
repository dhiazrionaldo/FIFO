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
    accessorKey: "current_qty",
    header: "Current Qty",
  },
  // {
  //   accessorKey: "created_by",
  //   header: "Created By",
  // },
  // {
  //   accessorKey: "created_datetime",
  //   header: "Created Date",
  //   cell: ({row}) =>{
  //     const dateValue = row.getValue('created_datetime');


  //     const date = new Date(row.getValue('created_datetime'));

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
  {
    accessorKey: "modified_by",
    header: "Modified By",
  },
  {
    accessorKey: "modified_datetime",
    header: "Modified Date",
    cell: ({row}) =>{
      const dateValue = row.getValue('modified_datetime');


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
  // {
  //   accessorKey: "item_name",
  //   header: ({column}) =>{
  //       return(
  //           <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}>
  //               Item Name
  //               <ArrowUpDown className="ml-2 h-4 w-4" />
  //           </Button>
  //       )
  //   },
  // },
  // {
  //   accessorKey: "category_name",
  //   header: "Category",
  // },
  // {
  //   accessorKey: "qty",
  //   header: "Qty",
  // },
  // {
  //   accessorKey: "unit_price",
  //   header: "Unit Price",
  //   cell: ({row}) =>{
  //     const formattedCurrency = new Intl.NumberFormat('id-ID', {
  //       style: 'currency',
  //       currency: 'IDR',
  //       minimumFractionDigits: 0,
  //     }).format(row.original.unit_price);
      
  //     return <span>{formattedCurrency}</span>;
  //   }
  // },
  // {
  //   accessorKey: "total_price",
  //   header: "Total Price",
  //   cell: ({row}) =>{
  //     const formattedCurrency = new Intl.NumberFormat('id-ID', {
  //       style: 'currency',
  //       currency: 'IDR',
  //       minimumFractionDigits: 0,
  //     }).format(row.original.total_price);
      
  //     return <span>{formattedCurrency}</span>;
  //   }
  // },
  // {
  //   accessorKey: "transaction_date",
  //   header: ({column}) =>{
  //     return(
  //         <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}>
  //             Order Date
  //             <ArrowUpDown className="ml-2 h-4 w-4" />
  //         </Button>
  //     )
  //   },
  //   cell: ({row}) =>{
  //     const dateValue = row.getValue('transaction_date');


  //     const date = new Date(row.getValue('order_date'));

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
  // {
  //   accessorKey: "modified_by",
  //   header: "Modified By",
  // },
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
