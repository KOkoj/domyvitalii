import React from 'react';
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'error';
  user: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-50';
      case 'pending':
        return 'text-yellow-800 bg-yellow-50';
      case 'error':
        return 'text-red-800 bg-red-50';
      default:
        return 'text-gray-800 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Dokončeno';
      case 'pending':
        return 'Čeká';
      case 'error':
        return 'Chyba';
      default:
        return 'Neznámý';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'právě teď';
    if (diffInMinutes < 60) return `před ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `před ${Math.floor(diffInMinutes / 60)} h`;
    return `před ${Math.floor(diffInMinutes / 1440)} dní`;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Nedávná aktivita
          </h3>
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádná aktivita</h3>
            <p className="mt-1 text-sm text-gray-500">
              Začněte prací na svých nemovitostech nebo článcích.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Nedávná aktivita
        </h3>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        {getStatusIcon(activity.status)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {activity.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {getStatusText(activity.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="#"
            className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Zobrazit všechnu aktivitu
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity; 