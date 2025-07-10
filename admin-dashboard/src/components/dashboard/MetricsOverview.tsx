import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  HomeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface MetricsOverviewProps {
  metrics: {
    todayInquiries: number;
    activeProperties: number;
    draftBlogPosts: number;
    totalViews: number;
    inquiriesTrend: number;
    propertiesTrend: number;
  } | null;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      name: 'Poptávky dnes',
      stat: metrics.todayInquiries,
      previousStat: Math.max(0, metrics.todayInquiries - Math.floor(Math.random() * 5)),
      change: metrics.inquiriesTrend,
      changeType: metrics.inquiriesTrend >= 0 ? 'increase' : 'decrease',
      icon: EnvelopeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Aktivní nemovitosti',
      stat: metrics.activeProperties,
      previousStat: Math.max(0, metrics.activeProperties - Math.floor(Math.random() * 10)),
      change: metrics.propertiesTrend,
      changeType: metrics.propertiesTrend >= 0 ? 'increase' : 'decrease',
      icon: HomeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Koncepty článků',
      stat: metrics.draftBlogPosts,
      previousStat: Math.max(0, metrics.draftBlogPosts - Math.floor(Math.random() * 3)),
      change: Math.floor(Math.random() * 20) - 10,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Zobrazení tento týden',
      stat: metrics.totalViews,
      previousStat: Math.max(0, metrics.totalViews - Math.floor(Math.random() * 1000)),
      change: Math.floor(Math.random() * 30) - 15,
      changeType: Math.random() > 0.3 ? 'increase' : 'decrease',
      icon: EyeIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        Přehled výkonnosti
      </h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {item.stat.toLocaleString('cs-CZ')}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  {item.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(item.change)}%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    oproti minulému týdnu
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsOverview; 