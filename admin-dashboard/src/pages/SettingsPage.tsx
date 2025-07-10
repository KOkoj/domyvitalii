import React, { useState, useEffect } from 'react';
import { 
  CogIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BellIcon,
  UserIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { api } from '../lib/api';

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  default_language: string;
  timezone: string;
  currency: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  security_level: 'low' | 'medium' | 'high';
  backup_enabled: boolean;
  maintenance_mode: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    site_name: 'Domy v Italii',
    site_description: 'Váš spolehlivý partner pro nákup nemovitostí v Italii',
    contact_email: 'info@domyvitalii.cz',
    contact_phone: '+420 123 456 789',
    default_language: 'cs',
    timezone: 'Europe/Prague',
    currency: 'EUR',
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    security_level: 'medium',
    backup_enabled: true,
    maintenance_mode: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      if (response.data.data) {
        setSettings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Keep default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.put('/settings', settings);
      setSuccess('Nastavení bylo úspěšně uloženo!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Nepodařilo se uložit nastavení');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', name: 'Obecné', icon: CogIcon },
    { id: 'security', name: 'Zabezpečení', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifikace', icon: BellIcon },
    { id: 'localization', name: 'Lokalizace', icon: GlobeAltIcon },
    { id: 'backup', name: 'Zálohování', icon: DocumentTextIcon },
  ];

  if (loading && !settings.site_name) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Nastavení systému
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Spravujte konfiguraci a nastavení administračního systému
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckCircleIcon className="h-4 w-4 mr-2" />
            )}
            Uložit změny
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Chyba</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Úspěch</h3>
              <p className="mt-1 text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Základní informace</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Název webu
                    </label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kontaktní e-mail
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kontaktní telefon
                    </label>
                    <input
                      type="tel"
                      value={settings.contact_phone}
                      onChange={(e) => updateSetting('contact_phone', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Měna
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="CZK">CZK (Kč)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Popis webu
                    </label>
                    <textarea
                      rows={3}
                      value={settings.site_description}
                      onChange={(e) => updateSetting('site_description', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Systémové nastavení</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Režim údržby</h4>
                      <p className="text-sm text-gray-500">Deaktivuje web pro běžné uživatele</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenance_mode}
                        onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Zabezpečení</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Úroveň zabezpečení
                    </label>
                    <select
                      value={settings.security_level}
                      onChange={(e) => updateSetting('security_level', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="low">Nízká</option>
                      <option value="medium">Střední</option>
                      <option value="high">Vysoká</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Vyšší úroveň vyžaduje silnější hesla a častější přihlášení
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Bezpečnostní doporučení</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Pravidelně aktualizujte hesla</li>
                        <li>Používejte dvoufaktorovou autentifikaci</li>
                        <li>Monitorujte přihlašovací aktivity</li>
                        <li>Pravidelně zálohujte data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifikace</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Povolit notifikace</h4>
                      <p className="text-sm text-gray-500">Obecné zapnutí/vypnutí všech notifikací</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications_enabled}
                        onChange={(e) => updateSetting('notifications_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">E-mailové notifikace</h4>
                      <p className="text-sm text-gray-500">Dostávat upozornění e-mailem</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                        disabled={!settings.notifications_enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS notifikace</h4>
                      <p className="text-sm text-gray-500">Dostávat upozornění SMS zprávami</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sms_notifications}
                        onChange={(e) => updateSetting('sms_notifications', e.target.checked)}
                        disabled={!settings.notifications_enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Localization Settings */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lokalizace</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Výchozí jazyk
                    </label>
                    <select
                      value={settings.default_language}
                      onChange={(e) => updateSetting('default_language', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="cs">Čeština</option>
                      <option value="en">English</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Časové pásmo
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="Europe/Prague">Praha (UTC+1)</option>
                      <option value="Europe/Rome">Řím (UTC+1)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Zálohování</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Automatické zálohování</h4>
                      <p className="text-sm text-gray-500">Pravidelné automatické zálohování dat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.backup_enabled}
                        onChange={(e) => updateSetting('backup_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Informace o zálohování</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Automatické zálohy se spouští každý den ve 2:00 ráno.</p>
                      <p className="mt-1">Poslední záloha: Dnes v 02:00</p>
                      <p className="mt-1">Další záloha: Zítra v 02:00</p>
                    </div>
                    <div className="mt-4">
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        Spustit zálohu nyní
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 