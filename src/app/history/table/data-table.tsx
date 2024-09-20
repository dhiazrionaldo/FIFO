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
import { Input } from "@/components/ui/input"
import React from "react"
import { DataTablePagination } from "./data-table-pagination"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { DetailTable } from './detail-table';

export const maxDuration = 60;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  from: Date | undefined;
  to: Date | undefined;
}

export function DataTable<TData extends { kode_sku: string; id: number }, TValue>({
  columns,
  data,
  from,
  to,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expandedSku, setExpandedSku] = React.useState<string | null>(null);

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
              <Collapsible key={row.id} asChild>
                <>
                  <TableRow
                      key={row.id}
                      onClick={() => setExpandedSku(row.original.kode_sku)}
                      data-state={row.getIsSelected() && "selected"}
                  >
                      {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      ))}
                  </TableRow>
                  <CollapsibleContent key={row.original.id} asChild>
                    <tr>
                      <td colSpan={columns.length} className="p-0">
                        <div className="pl-4">
                          <DetailTable kode_sku={row.original.kode_sku} from={from} to={to} />
                        </div>
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
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
