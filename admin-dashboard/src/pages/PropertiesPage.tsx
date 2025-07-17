import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import { useProperties, useDeleteProperty } from '@/hooks/useApi'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PropertyQuickFilters } from '@/components/properties/PropertyQuickFilters'
import { PropertyBulkActions } from '@/components/properties/PropertyBulkActions'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import type { Property } from '@/types'

export default function PropertiesPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)

  const deleteProperty = useDeleteProperty()

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return
    
    try {
      await deleteProperty.mutateAsync(propertyToDelete.id)
    } catch (error) {
      // Error is already handled by the mutation hook
    } finally {
      setPropertyToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  // Fetch properties with filters
  const { data, isLoading, error } = useProperties({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  // Define table columns
  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: 'Název',
        cell: ({ row }) => (
          <div className="min-w-0 flex-1">
            <Link
              to={`/properties/${row.original.id}`}
              className="text-sm font-medium text-gray-900 hover:text-brand-600"
            >
              {row.getValue('title')}
            </Link>
            <p className="text-sm text-gray-500 truncate">
              {row.original.city}, {row.original.region}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Cena',
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {formatCurrency(row.getValue('price'), row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Typ',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {row.getValue('type')}
          </span>
        ),
        meta: {
          filterVariant: 'select',
          filterOptions: [
            { value: 'apartment', label: 'Byt' },
            { value: 'house', label: 'Dům' },
            { value: 'villa', label: 'Vila' },
            { value: 'land', label: 'Pozemek' },
          ],
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusColor(status)
              )}
            >
              {status === 'AVAILABLE' && 'Dostupné'}
              {status === 'SOLD' && 'Prodáno'}
              {status === 'RENTED' && 'Pronajato'}
              {status === 'DRAFT' && 'Koncept'}
            </span>
          )
        },
        meta: {
          filterVariant: 'select',
          filterOptions: [
            { value: 'AVAILABLE', label: 'Dostupné' },
            { value: 'SOLD', label: 'Prodáno' },
            { value: 'RENTED', label: 'Pronajato' },
            { value: 'DRAFT', label: 'Koncept' },
          ],
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Vytvořeno',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('createdAt'))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Akce',
        cell: ({ row }) => (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`/properties/${row.original.id}`}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    )}
                  >
                    <EyeIcon className="mr-3 h-4 w-4" />
                    Zobrazit
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to={`/properties/${row.original.id}/edit`}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    )}
                  >
                    <PencilIcon className="mr-3 h-4 w-4" />
                    Upravit
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleDeleteClick(row.original)}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm',
                      active ? 'bg-gray-100 text-red-900' : 'text-red-700'
                    )}
                  >
                    <TrashIcon className="mr-3 h-4 w-4" />
                    Smazat
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [deleteProperty]
  )

  const selectedCount = Object.keys(selectedRows).length

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Nepodařilo se načíst nemovitosti. Zkuste to znovu.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nemovitosti</h1>
          <p className="text-gray-600">
            Spravujte všechny nemovitosti ve vašem portfoliu
          </p>
        </div>
        <Button asChild>
          <Link to="/properties/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            Přidat nemovitost
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <PropertyQuickFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <PropertyBulkActions
          selectedCount={selectedCount}
          onBulkAction={(action) => {
    
            if (action === 'clear') {
              setSelectedRows({})
            }
          }}
        />
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-soft">
        <DataTable
          columns={columns}
          data={data?.data || []}
          totalCount={data?.pagination.total}
          pageCount={data?.pagination.totalPages}
          pagination={pagination}
          onPaginationChange={setPagination}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          rowSelection={selectedRows}
          onRowSelectionChange={setSelectedRows}
          loading={isLoading}
          searchPlaceholder="Hledat nemovitosti..."
          emptyMessage="Žádné nemovitosti nebyly nalezeny."
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-gray-900">
            {data?.pagination.total || 0}
          </div>
          <div className="text-sm text-gray-600">Celkem nemovitostí</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-green-600">
            {(data?.data || []).filter(p => p.status === 'AVAILABLE').length}
          </div>
          <div className="text-sm text-gray-600">Dostupné</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-blue-600">
            {(data?.data || []).filter(p => p.status === 'SOLD').length}
          </div>
          <div className="text-sm text-gray-600">Prodané</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-purple-600">
            {(data?.data || []).filter(p => p.status === 'RENTED').length}
          </div>
          <div className="text-sm text-gray-600">Pronajmané</div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Smazat nemovitost"
        description={`Opravdu chcete smazat nemovitost "${propertyToDelete?.title}"? Tato akce je nevratná.`}
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
} 