import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  HomeIcon, 
  EnvelopeIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import ProductivityTools from '../components/dashboard/ProductivityTools';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { api } from '../lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useDashboardStats, useRecentActivity as useRecentActivityHook } from '@/hooks/useApi'
import { formatNumber, formatPercentage, formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface DashboardMetrics {
  todayInquiries: number;
  activeProperties: number;
  draftBlogPosts: number;
  totalViews: number;
  recentActivity: any[];
  inquiriesTrend: number;
  propertiesTrend: number;
}

// Mock chart data
const inquiryTrendData = [
  { name: 'Po', value: 12 },
  { name: 'Út', value: 19 },
  { name: 'St', value: 15 },
  { name: 'Čt', value: 27 },
  { name: 'Pá', value: 22 },
  { name: 'So', value: 18 },
  { name: 'Ne', value: 14 },
]

const propertyViewsData = [
  { name: 'Leden', views: 4000, inquiries: 240 },
  { name: 'Únor', views: 3000, inquiries: 139 },
  { name: 'Březen', views: 2000, inquiries: 980 },
  { name: 'Duben', views: 2780, inquiries: 390 },
  { name: 'Květen', views: 1890, inquiries: 480 },
  { name: 'Červen', views: 2390, inquiries: 380 },
]

// KPI Card Component
interface KPICardProps {
  title: string
  value: string | number
  trend: number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'yellow' | 'purple'
  chart?: React.ReactNode
}

function KPICard({ title, value, trend, icon: Icon, color, chart }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
  }

  const [bgColor, textColor, lightBg] = colorClasses[color].split(' ')

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(Number(value))}</p>
        </div>
        <div className={`p-3 rounded-lg ${lightBg}`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          {trend > 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={cn(
            'text-sm font-medium',
            trend > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatPercentage(Math.abs(trend))}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs. minulý týden</span>
        </div>
        
        {chart && (
          <div className="w-20 h-8">
            {chart}
          </div>
        )}
      </div>
    </div>
  )
}

// Quick Action Card Component
interface QuickActionProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionProps) {
  return (
    <Link to={href} className="group">
      <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-all group-hover:scale-105">
        <div className={`p-3 rounded-lg ${color} w-fit mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex items-center mt-4 text-brand-600 group-hover:text-brand-700">
          <span className="text-sm font-medium">Přejít</span>
          <ArrowUpIcon className="h-4 w-4 ml-1 rotate-45" />
        </div>
      </div>
    </Link>
  )
}

// Main Dashboard Component
const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activityLoading } = useRecentActivityHook(5)

  if (statsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Přehled vašeho webu a aktivit
          </p>
        </div>
        <Link to="/properties/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Přidat nemovitost
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Nové poptávky dnes"
          value={stats?.inquiries.today || 0}
          trend={stats?.inquiries.trend || 0}
          icon={EnvelopeIcon}
          color="blue"
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inquiryTrendData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
        
        <KPICard
          title="Aktivní nemovitosti"
          value={stats?.properties.active || 0}
          trend={stats?.properties.trend || 0}
          icon={BuildingOfficeIcon}
          color="green"
        />
        
        <KPICard
          title="Koncepty článků"
          value={stats?.blogPosts.draft || 0}
          trend={stats?.blogPosts.trend || 0}
          icon={DocumentTextIcon}
          color="yellow"
        />
        
        <KPICard
          title="Návštěvy týden"
          value={stats?.pageViews.thisWeek || 0}
          trend={stats?.pageViews.trend || 0}
          icon={EyeIcon}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rychlé akce</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Přidat nemovitost"
            description="Vytvořte nový inzerát nemovitosti"
            icon={BuildingOfficeIcon}
            href="/properties/new"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Napsat článek"
            description="Publikujte nový blog článek"
            icon={DocumentTextIcon}
            href="/blog/new"
            color="bg-green-500"
          />
          <QuickActionCard
            title="Správa poptávek"
            description="Odpovězte na nové poptávky"
            icon={EnvelopeIcon}
            href="/inquiries"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Návštěvy a poptávky
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyViewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3b82f6" name="Návštěvy" />
                <Bar dataKey="inquiries" fill="#10b981" name="Poptávky" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={
          activities?.map(activity => ({
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp: activity.createdAt,
            status: 'completed' as const,
            user: activity.user.name,
          })) || []
        } />
      </div>
    </div>
  );
};

export default DashboardPage; 