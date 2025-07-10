import { useState, useMemo, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
} from '@tanstack/react-table'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { Input } from './Input'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount?: number
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  globalFilter?: string
  onGlobalFilterChange?: (filter: string) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
  loading?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageCount,
  pagination,
  onPaginationChange,
  globalFilter = '',
  onGlobalFilterChange,
  sorting = [],
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  rowSelection = {},
  onRowSelectionChange,
  loading = false,
  searchPlaceholder = 'Hledat...',
  emptyMessage = 'Žádná data nebyla nalezena.',
  className,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
    onPaginationChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(pagination && { pagination }),
    },
    globalFilterFn: 'includesString',
    onGlobalFilterChange,
    manualPagination: !!pagination,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onColumnFiltersChange,
    pageCount: pageCount,
    rowCount: totalCount,
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Column Filters */}
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => {
              const canFilter = header.column.getCanFilter()
              if (!canFilter) return null
              
              return (
                <div key={header.id}>
                  {header.column.columnDef.meta?.filterVariant === 'select' ? (
                    <select
                      value={(header.column.getFilterValue() as string) ?? ''}
                      onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">Všechny</option>
                      {(header.column.columnDef.meta?.filterOptions as Array<{value: string, label: string}>)?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder={`Filtrovat ${header.column.columnDef.header}...`}
                      value={(header.column.getFilterValue() as string) ?? ''}
                      onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                      className="max-w-40"
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
        
        {/* Column Visibility */}
        <Menu as="div" className="relative">
          <Menu.Button as={Button} variant="outline" size="sm">
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Sloupce
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          </Menu.Button>
          
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-2">
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <Menu.Item key={column.id}>
                  <label className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : column.id}
                    </span>
                    {column.getIsVisible() ? (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </label>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Menu>
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center space-x-2',
                            header.column.getCanSort() && 'cursor-pointer select-none hover:text-gray-700'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUpIcon className="h-4 w-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDownIcon className="h-4 w-4" />
                              ) : (
                                <div className="h-4 w-4 opacity-50">
                                  <ChevronUpIcon className="h-2 w-4" />
                                  <ChevronDownIcon className="h-2 w-4 -mt-1" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                      <span className="text-gray-500">Načítání...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      row.getIsSelected() && 'bg-brand-50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-700">
            {table.getRowModel().rows.length > 0 ? (
              <>
                Zobrazeno {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} až{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  totalCount || table.getRowModel().rows.length
                )}{' '}
                z {totalCount || table.getRowModel().rows.length} záznamů
              </>
            ) : (
              'Žádné záznamy'
            )}
          </p>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} na stránku
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-700">Stránka</span>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} z {table.getPageCount()}
            </strong>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 