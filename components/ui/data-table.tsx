"use client"

import type React from "react"
import { useState, useMemo } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  enablePagination?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Tidak ada data",
  enablePagination = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedData = useMemo(() => {
    if (!enablePagination) return data
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize, enablePagination])

  const startItem = enablePagination ? (currentPage - 1) * pageSize + 1 : 1
  const endItem = enablePagination ? Math.min(currentPage * pageSize, totalItems) : totalItems

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize)
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const displayData = enablePagination ? paginatedData : data

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
        {enablePagination && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        )}
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
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((item, index) => (
              <TableRow key={enablePagination ? (currentPage - 1) * pageSize + index : index} className="hover:bg-gray-50 transition-colors">
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

      {enablePagination && totalItems > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {startItem} sampai {endItem} dari {totalItems} hasil
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700">Baris per halaman:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
