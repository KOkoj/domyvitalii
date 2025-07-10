import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  ClockIcon, 
  CommandLineIcon,
  StarIcon,
  DocumentDuplicateIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const ProductivityTools: React.FC = () => {
  const [savedSearches] = useState([
    { id: 1, name: 'Luxusní vily v Toskánsku', query: 'location:tuscany type:villa price:>500000', count: 12 },
    { id: 2, name: 'Nové poptávky tento týden', query: 'status:new created:this-week', count: 8 },
    { id: 3, name: 'Koncepty článků', query: 'status:draft type:blog', count: 5 },
  ]);

  const [recentItems] = useState([
    { id: 1, type: 'property', title: 'Villa Bella Vista', href: '/properties/1', timestamp: '2 min' },
    { id: 2, type: 'blog', title: 'Průvodce nákupem nemovitostí', href: '/blog/2', timestamp: '15 min' },
    { id: 3, type: 'inquiry', title: 'Poptávka - Apartmán Řím', href: '/inquiries/3', timestamp: '1 h' },
  ]);

  const [tips] = useState([
    { 
      id: 1, 
      title: 'Klávesové zkratky', 
      description: 'Použijte ⌘ + K pro rychlé vyhledávání napříč celou aplikací' 
    },
    { 
      id: 2, 
      title: 'Hromadné operace', 
      description: 'Vyberte více nemovitostí pomocí Shift+klik pro hromadné úpravy' 
    },
    { 
      id: 3, 
      title: 'Šablony článků', 
      description: 'Vytvořte si vlastní šablony pro rychlejší psaní článků' 
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return '🏠';
      case 'blog':
        return '📝';
      case 'inquiry':
        return '📧';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'text-blue-600 bg-blue-50';
      case 'blog':
        return 'text-green-600 bg-green-50';
      case 'inquiry':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Nástroje produktivity
        </h3>

        {/* Saved Searches */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <BookmarkIcon className="h-4 w-4 mr-2" />
              Uložená vyhledávání
            </h4>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{search.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{search.query}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{search.count} výsledků</span>
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-500">
              + Přidat nové vyhledávání
            </button>
          </div>

          {/* Recent Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              Nedávné položky
            </h4>
            <div className="space-y-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${getTypeColor(item.type)}`}>
                        {item.type === 'property' ? 'Nemovitost' : 
                         item.type === 'blog' ? 'Článek' : 
                         item.type === 'inquiry' ? 'Poptávka' : item.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{item.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Rychlé tipy
            </h4>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div
                  key={tip.id}
                  className={`p-3 rounded-md border-l-4 ${
                    index === 0 ? 'bg-blue-50 border-blue-400' :
                    index === 1 ? 'bg-green-50 border-green-400' :
                    'bg-yellow-50 border-yellow-400'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{tip.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{tip.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <CommandLineIcon className="h-3 w-3 mr-1" />
                Cmd paleta
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <DocumentDuplicateIcon className="h-3 w-3 mr-1" />
                Duplikovat
              </button>
              <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <MagnifyingGlassIcon className="h-3 w-3 mr-1" />
                Vyhledat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTools; 