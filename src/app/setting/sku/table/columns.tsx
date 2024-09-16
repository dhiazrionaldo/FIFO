/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import{Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { EditSKU } from "./edit-sku"
import { DeleteSKU } from "./delete-sku"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const maxDuration = 60;

export type settingSKU = {
  id: string
  category_name: string
  description: string
  created_by: string
  created_datetime: string
  modified_by: string
  modified_datetime: string
}

export const columns: ColumnDef<settingSKU>[] = [
  {
    accessorKey: "category_name",
    header: ({column}) =>{
        return(
            <Button variant="ghost" onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}>
                Category Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "created_by",
    header: "Created By",
  },
  {
    accessorKey: "created_datetime",
    header: "Created Date",
    cell: ({row}) =>{
        const date = new Date(row.getValue('created_datetime'));
        const formattedDate = date.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    }).replace(/ /g, ' ');
        return <div>{formattedDate}</div>
    }
  },
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
  {
    id: "actions",
    cell: ({ row }) => {
      const sku = row.original
      const [isSheetOpen, setSheetOpen] = useState(false);
 
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
            <DropdownMenuItem><DeleteSKU id={sku.id} /></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sku.id)}>
                Copy sku ID
            </DropdownMenuItem>
            </DropdownMenuContent>
            <EditSKU sku={sku} isOpen={isSheetOpen} onOpenChange={setSheetOpen} />
        </DropdownMenu>
      )
    },
  },
]
