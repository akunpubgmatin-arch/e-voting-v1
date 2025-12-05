"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export interface Column<T> {
  key: string
  header: string
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Tidak ada data",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <TableHead key={column.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            {columns.map((column) => (
              <TableHead key={column.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <TableCell key={column.key} className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}>
                    {column.cell ? column.cell(item) : ((item as any)[column.key] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
