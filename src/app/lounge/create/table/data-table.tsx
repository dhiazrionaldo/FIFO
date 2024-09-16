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
import { CheckCircle2, CirclePlus, SaveIcon } from "lucide-react"
import Link from "next/link"
import { DataTablePagination } from "./data-table-pagination"
import { DrawerClose } from "@/components/ui/drawer"
import { useSelectedRow } from '@/app/lounge/selected-row-provider';

export const maxDuration = 60;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [selectedRows, setSelectedRow] = React.useState<any[]>([]);
  const { setSelectedRows } = useSelectedRow();

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
  const handleGetSelectedRows = () => {
    const selectedRowData = table.getSelectedRowModel().rows.map(row => row.original);
    setSelectedRow(selectedRowData);
    setSelectedRows(selectedRowData);

  };

  return (
    <>  
        <div className="flex items-center py-4">
            <Input
            placeholder="Search item name..."
            value={(table.getColumn("item_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("item_name")?.setFilterValue(event.target.value)
            }
            className="max-w mr-2"
            />
            <DrawerClose asChild>
              <Button className='text-white max-w-[200px]' type='submit' onClick={handleGetSelectedRows}>
                <CheckCircle2 className="mr-2 capitalize"/> SUBMIT
              </Button>
            </DrawerClose>
            
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
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button> */}
      </div>
    </>
  )
}
