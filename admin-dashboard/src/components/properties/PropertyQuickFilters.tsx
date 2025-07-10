import { 
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
  count?: number
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

interface PropertyQuickFiltersProps {
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  typeFilter: string
  onTypeFilterChange: (type: string) => void
}

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'Všechny', icon: BuildingOfficeIcon, color: 'text-gray-600' },
  { value: 'AVAILABLE', label: 'Dostupné', icon: CheckCircleIcon, color: 'text-green-600' },
  { value: 'SOLD', label: 'Prodané', icon: ExclamationTriangleIcon, color: 'text-blue-600' },
  { value: 'RENTED', label: 'Pronajmuté', icon: ClockIcon, color: 'text-purple-600' },
  { value: 'DRAFT', label: 'Koncepty', icon: EyeSlashIcon, color: 'text-gray-600' },
]

const typeOptions: FilterOption[] = [
  { value: 'all', label: 'Všechny typy' },
  { value: 'apartment', label: 'Byty' },
  { value: 'house', label: 'Domy' },
  { value: 'villa', label: 'Vily' },
  { value: 'land', label: 'Pozemky' },
]

function FilterButton({ 
  option, 
  isActive, 
  onClick 
}: { 
  option: FilterOption
  isActive: boolean
  onClick: () => void 
}) {
  const Icon = option.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
        isActive
          ? 'bg-brand-50 border-brand-200 text-brand-700'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
      )}
    >
      {Icon && (
        <Icon className={cn(
          'h-4 w-4',
          isActive ? 'text-brand-600' : option.color || 'text-gray-400'
        )} />
      )}
      {option.label}
      {option.count !== undefined && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 rounded-full text-xs',
          isActive
            ? 'bg-brand-100 text-brand-600'
            : 'bg-gray-100 text-gray-600'
        )}>
          {option.count}
        </span>
      )}
    </button>
  )
}

export function PropertyQuickFilters({
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: PropertyQuickFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Status Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrovat podle stavu</h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <FilterButton
              key={option.value}
              option={option}
              isActive={statusFilter === option.value}
              onClick={() => onStatusFilterChange(option.value)}
            />
          ))}
        </div>
      </div>

      {/* Type Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrovat podle typu</h3>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <FilterButton
              key={option.value}
              option={option}
              isActive={typeFilter === option.value}
              onClick={() => onTypeFilterChange(option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 