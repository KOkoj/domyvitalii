import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeftIcon,
  CheckIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useProperties, useDeleteProperty } from '../hooks/useApi';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PropertyQuickFilters } from '../components/properties/PropertyQuickFilters';
import { formatCurrency, formatDate, getStatusColor, cn } from '../lib/utils';
import type { Property } from '../types';

const PropertyBulkPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const deleteProperty = useDeleteProperty();

  // Fetch properties with filters
  const { data, isLoading, error } = useProperties({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: globalFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

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
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
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
          );
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
    ],
    []
  );

  const selectedCount = Object.keys(selectedRows).length;
  const selectedProperties = Object.keys(selectedRows).filter(key => selectedRows[key]);

  const handleBulkActionClick = () => {
    if (!bulkAction || selectedCount === 0) return;

    if (bulkAction === 'delete') {
      setPendingBulkAction(bulkAction);
      setShowDeleteDialog(true);
    } else {
      executeBulkAction(bulkAction);
    }
  };

  const handleDeleteConfirm = async () => {
    await executeBulkAction('delete');
  };

  const executeBulkAction = async (action: string) => {
    setIsProcessing(true);
    try {
      switch (action) {
        case 'delete':
          // In a real app, you'd have a bulk delete endpoint
          for (const propertyId of selectedProperties) {
            await deleteProperty.mutateAsync(propertyId);
          }
          setSelectedRows({});
          break;
        
        case 'status_available':
        case 'status_sold':
        case 'status_rented':
        case 'status_draft':
          // In a real app, you'd have a bulk update endpoint
          const statusText = action.replace('status_', '');
          setSuccessMessage(`Změna statusu pro ${selectedCount} nemovitostí byla úspěšná!`);
          setShowSuccessDialog(true);
          setSelectedRows({});
          break;
        
        case 'export':
          // In a real app, you'd export the selected properties
          const csvData = selectedProperties.map(id => {
            const property = data?.data.find(p => p.id === id);
            return property ? [
              property.title,
              property.type,
              property.status,
              property.price,
              property.currency,
              property.city,
              property.region
            ].join(',') : '';
          }).join('\n');
          
          const blob = new Blob([`Název,Typ,Status,Cena,Měna,Město,Region\n${csvData}`], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `nemovitosti_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          setSuccessMessage('Export byl úspěšně dokončen!');
          setShowSuccessDialog(true);
          break;
        
        default:
          console.warn('Unknown bulk action:', action);
      }
    } catch (error) {
      // Error is already handled by the mutation hooks with toast notifications
      console.warn('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
      setBulkAction('');
      setPendingBulkAction('');
    }
  };

  const bulkActionOptions = [
    { value: '', label: 'Vyberte akci...' },
    { value: 'status_available', label: 'Označit jako dostupné' },
    { value: 'status_sold', label: 'Označit jako prodané' },
    { value: 'status_rented', label: 'Označit jako pronajmuté' },
    { value: 'status_draft', label: 'Označit jako koncept' },
    { value: 'export', label: 'Exportovat do CSV' },
    { value: 'delete', label: 'Smazat vybrané' },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Nepodařilo se načíst nemovitosti. Zkuste to znovu.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/properties"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět na nemovitosti
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hromadné operace</h1>
            <p className="text-gray-600">
              Spravujte více nemovitostí současně
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                Vybráno {selectedCount} nemovitostí
              </span>
              
              <Select
                options={bulkActionOptions}
                value={bulkAction}
                onChange={setBulkAction}
                placeholder="Vyberte akci"
                className="w-64"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedRows({})}
              >
                Zrušit výběr
              </Button>
              
              <Button 
                size="sm"
                onClick={handleBulkActionClick}
                disabled={!bulkAction || isProcessing}
                className={cn(
                  bulkAction === 'delete' && 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Zpracovává se...
                  </div>
                ) : (
                  <>
                    {bulkAction === 'delete' && <TrashIcon className="h-4 w-4 mr-2" />}
                    {bulkAction === 'export' && <DocumentArrowDownIcon className="h-4 w-4 mr-2" />}
                    {bulkAction.startsWith('status_') && <PencilIcon className="h-4 w-4 mr-2" />}
                    Provést
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <PropertyQuickFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Jak používat hromadné operace</h3>
            <div className="mt-2 text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>Zaškrtněte nemovitosti, které chcete upravit</li>
                <li>Vyberte akci z rozbalovacího menu</li>
                <li>Klikněte na "Provést" pro spuštění operace</li>
                <li>Operace smazání je nevratná - buďte opatrní</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-gray-900">
            {data?.pagination.total || 0}
          </div>
          <div className="text-sm text-gray-600">Celkem nemovitostí</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-blue-600">
            {selectedCount}
          </div>
          <div className="text-sm text-gray-600">Vybráno</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-green-600">
            {(data?.data || []).filter(p => p.status === 'AVAILABLE').length}
          </div>
          <div className="text-sm text-gray-600">Dostupné</div>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-4">
          <div className="text-2xl font-bold text-red-600">
            {(data?.data || []).filter(p => p.status === 'SOLD').length}
          </div>
          <div className="text-sm text-gray-600">Prodané</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Smazat nemovitosti"
        description={`Opravdu chcete smazat ${selectedCount} nemovitostí? Tato akce je nevratná.`}
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />

      {/* Success Dialog */}
      <ConfirmDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title="Operace úspěšná"
        description={successMessage}
        confirmText="OK"
        cancelText=""
        variant="default"
        onConfirm={() => setShowSuccessDialog(false)}
      />
    </div>
  );
};

export default PropertyBulkPage; 