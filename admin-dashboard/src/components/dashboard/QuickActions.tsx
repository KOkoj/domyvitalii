import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  BoltIcon,
  CommandLineIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const QuickActions: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const quickActions = [
    {
      name: 'Přidat nemovitost',
      description: 'Vytvořit nový seznam nemovitostí',
      href: '/properties/new',
      icon: PlusIcon,
      iconBackground: 'bg-blue-500',
      shortcut: '⌘ + P'
    },
    {
      name: 'Nový článek',
      description: 'Napsat nový blog článek',
      href: '/blog/new',
      icon: DocumentTextIcon,
      iconBackground: 'bg-green-500',
      shortcut: '⌘ + B'
    },
    {
      name: 'Nahrát obrázky',
      description: 'Hromadně nahrát obrázky nemovitostí',
      onClick: () => document.getElementById('image-upload')?.click(),
      icon: PhotoIcon,
      iconBackground: 'bg-purple-500',
      shortcut: '⌘ + U'
    },
    {
      name: 'Hromadné akce',
      description: 'Operace s více nemovitostmi najednou',
      href: '/properties/bulk',
      icon: BoltIcon,
      iconBackground: 'bg-orange-500',
      shortcut: '⌘ + M'
    }
  ];

  const keyboardShortcuts = [
    { key: '⌘ + K', action: 'Otevřít vyhledávání' },
    { key: '⌘ + /', action: 'Zobrazit všechny zkratky' },
    { key: 'G + D', action: 'Přejít na Dashboard' },
    { key: 'G + P', action: 'Přejít na Nemovitosti' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Rychlé akce
        </h3>
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <div key={action.name}>
              {action.href ? (
                <Link
                  to={action.href}
                  className="relative group rounded-lg p-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50 transition-colors"
                >
                  <ActionContent action={action} />
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="relative group rounded-lg p-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <ActionContent action={action} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Upload Progress */}
        {uploadProgress !== null && (
          <div className="mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center">
                <PhotoIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">Nahrávání obrázků...</p>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-blue-600 font-medium">{uploadProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Keyboard Shortcuts */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Klávesové zkratky
          </h4>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {keyboardShortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{shortcut.action}</span>
                <kbd className="inline-flex items-center rounded border border-gray-200 px-2 py-1 text-xs font-mono text-gray-500">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionContent: React.FC<{ action: any }> = ({ action }) => (
  <>
    <div>
      <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${action.iconBackground}`}>
        <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
      </span>
    </div>
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          {action.name}
        </h3>
        <kbd className="inline-flex items-center rounded border border-gray-200 px-2 py-1 text-xs font-mono text-gray-500">
          {action.shortcut}
        </kbd>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {action.description}
      </p>
    </div>
  </>
);

export default QuickActions; 