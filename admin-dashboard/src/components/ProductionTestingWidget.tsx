import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  XMarkIcon,
  GlobeAltIcon,
  ServerIcon,
  BoltIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface EnvironmentInfo {
  name: string;
  apiUrl: string;
  isProduction: boolean;
  color: string;
}

const ProductionTestingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentEnv, setCurrentEnv] = useState<EnvironmentInfo | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const environments: EnvironmentInfo[] = [
    {
      name: 'Development',
      apiUrl: 'http://localhost:3001/api',
      isProduction: false,
      color: 'bg-blue-500',
    },
    {
      name: 'Production',
      apiUrl: 'https://domyvitalii-production.up.railway.app/api',
      isProduction: true,
      color: 'bg-red-500',
    },
  ];

  // Detect current environment
  useEffect(() => {
    const currentApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const env = environments.find(e => e.apiUrl === currentApiUrl) || environments[0];
    setCurrentEnv(env);
  }, []);

  // Check API status
  useEffect(() => {
    const checkApiStatus = async () => {
      if (!currentEnv) return;
      
      setApiStatus('checking');
      try {
        const response = await fetch(`${currentEnv.apiUrl}/health`, {
          method: 'GET',
          mode: 'cors',
        });
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setApiStatus('offline');
      }
    };

    if (isOpen) {
      checkApiStatus();
    }
  }, [currentEnv, isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Zkopírováno do schránky!');
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const testEndpoint = async (endpoint: string) => {
    if (!currentEnv) return;
    
    try {
      const response = await fetch(`${currentEnv.apiUrl}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Test ${endpoint}: Úspěch (${response.status})`);
      } else {
        toast.error(`Test ${endpoint}: Chyba (${response.status})`);
      }
    } catch (error) {
      toast.error(`Test ${endpoint}: Chyba připojení`);
    }
  };

  if (!currentEnv) return null;

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'rounded-full p-3 shadow-lg transition-all duration-200',
            isOpen ? 'bg-gray-800 hover:bg-gray-700' : currentEnv.color
          )}
          title="Production Testing Widget"
        >
          {isOpen ? (
            <XMarkIcon className="h-5 w-5 text-white" />
          ) : (
            <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>

      {/* Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Produkční testování
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Current Environment */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aktuální prostředí
              </h4>
              <div className="flex items-center space-x-2">
                <div className={cn('w-3 h-3 rounded-full', currentEnv.color)}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentEnv.name}
                </span>
                <div className="flex items-center space-x-1">
                  {apiStatus === 'checking' && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                  )}
                  {apiStatus === 'online' && (
                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                  )}
                  {apiStatus === 'offline' && (
                    <XCircleIcon className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {apiStatus === 'checking' ? 'Testuje se...' : 
                     apiStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 break-all">
                {currentEnv.apiUrl}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rychlé akce
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => copyToClipboard(currentEnv.apiUrl)}
                >
                  <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                  Kopírovat API URL
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => copyToClipboard(window.location.origin)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Kopírovat Dashboard URL
                </Button>

                {currentEnv.isProduction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => openInNewTab('https://domyvitalii-production.up.railway.app')}
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Otevřít produkční web
                  </Button>
                )}
              </div>
            </div>

            {/* API Tests */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API testy
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testEndpoint('/health')}
                  className="text-xs"
                >
                  Health
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testEndpoint('/properties')}
                  className="text-xs"
                >
                  Properties
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testEndpoint('/blog')}
                  className="text-xs"
                >
                  Blog
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testEndpoint('/inquiries')}
                  className="text-xs"
                >
                  Inquiries
                </Button>
              </div>
            </div>

            {/* Environment Switcher */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Přepnout prostředí
              </h4>
              <div className="space-y-1">
                {environments.map((env) => (
                  <button
                    key={env.name}
                    onClick={() => {
                      copyToClipboard(`VITE_API_URL=${env.apiUrl}`);
                      toast.success(`Zkopírováno: VITE_API_URL=${env.apiUrl}\n\nVložte do .env souboru a restartujte aplikaci.`);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm border',
                      env.apiUrl === currentEnv.apiUrl
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={cn('w-2 h-2 rounded-full', env.color)}></div>
                      <span className="font-medium">{env.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {env.apiUrl}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Build: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</div>
                <div>Mode: {import.meta.env.MODE || 'development'}</div>
                <div>Node: {import.meta.env.NODE_ENV || 'development'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductionTestingWidget; 