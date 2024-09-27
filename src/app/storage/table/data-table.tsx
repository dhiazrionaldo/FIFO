"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React from "react"
import { CreateStockIn } from "./create-stockIn"
import { CirclePlus, CircleXIcon, Loader2, NotebookPenIcon, PackageOpenIcon } from "lucide-react"
import Link from "next/link"
import { DataTablePagination } from "./data-table-pagination";
import { useMediaQuery } from 'usehooks-ts';

export const maxDuration = 60;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  refreshData: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  refreshData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state:{
        sorting,
        columnFilters,
    }
  })

  if(isDesktop){
     return (
      <>  
          <div className="flex items-center py-4 gap-3">
              <Input
              placeholder="Search item name..."
              value={(table.getColumn("item_name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                  table.getColumn("item_name")?.setFilterValue(event.target.value)
              }
              className="max-w mr-2"
              />
              <CreateStockIn onSave={refreshData}/>
              {isLoading ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Button className="text-white bg-green-700 hover:bg-green-500" asChild>
                  <Link href="/storage/openingBalance" onClick={() => {setIsLoading(true)}}><PackageOpenIcon className="mr-2 h-6 w-6" />Open Balance</Link>
                </Button>
              )}
              {loading ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Button className="text-white bg-red-700 hover:bg-red-500" variant='secondary' asChild>
                  <Link href="/storage/closingBalance" onClick={() => {setLoading(true)}}><CircleXIcon className="mr-2 h-6 w-6" />Close Balance</Link>
                </Button>
              )}
          </div>
          <div className="rounded-md border">
          <Table>
              <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                      return (
                      <TableHead key={header.id}>
                          {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                              )}
                      </TableHead>
                      )
                  })}
                  </TableRow>
              ))}
              </TableHeader>
              <TableBody>
              {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                  <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                  >
                      {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      ))}
                  </TableRow>
                  ))
              ) : (
                  <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                  </TableCell>
                  </TableRow>
              )}
              </TableBody>
          </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <DataTablePagination table={table} />
        </div>
      </>
    )
  }
  return (
    <>
      <div className="flex flex-row items-center gap-3">
            <CreateStockIn onSave={refreshData}/>
            {isLoading ? (
              <Button className="text-white bg-green-700 hover:bg-green-500" asChild disabled>
                <Loader2 className="animate-spin mr-2 h-6 w-6" />Open Balance
              </Button>
              
            ) : (
              <Button className="text-white bg-green-700 hover:bg-green-500" asChild>
                <Link href="/storage/openingBalance" onClick={() => {setIsLoading(true)}}><PackageOpenIcon className="mr-2 h-6 w-6" />Open Balance</Link>
              </Button>
            )}
            {loading ? (
              <Button className="text-white bg-red-700 hover:bg-red-500" variant='secondary' asChild disabled>
                <Loader2 className="animate-spin mr-2 h-6 w-6" />Close Balance
              </Button>
            ) : (
              <Button className="text-white bg-red-700 hover:bg-red-500" variant='secondary' asChild>
                <Link href="/storage/closingBalance" onClick={() => {setLoading(true)}}><CircleXIcon className="mr-2 h-6 w-6" />Close Balance</Link>
              </Button>
            )}
        </div>
        <div className="flex items-center py-4 gap-3 md:flex-col">
            <Input
            placeholder="Search item name..."
            value={(table.getColumn("item_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("item_name")?.setFilterValue(event.target.value)
            }
            className="max-w mr-2"
            />
        </div>
        
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                    )
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <DataTablePagination table={table} />
      </div>
    </>
  )
 
}
