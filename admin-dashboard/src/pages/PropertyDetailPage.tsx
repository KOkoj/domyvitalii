import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  EyeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { useProperty, useDeleteProperty } from '../hooks/useApi';
import { formatCurrency, formatDate, getStatusColor, cn } from '../lib/utils';
import type { Property } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: property, isLoading: loading, error } = useProperty(id!);
  const deleteProperty = useDeleteProperty();

  const handleDelete = async () => {
    if (!property) return;
    
    try {
      await deleteProperty.mutateAsync(property.id);
      navigate('/properties');
    } catch (error) {
      // Error is already handled by the mutation hook
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Dostupné';
      case 'SOLD':
        return 'Prodáno';
      case 'RENTED':
        return 'Pronajato';
      case 'DRAFT':
        return 'Koncept';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Byt';
      case 'house':
        return 'Dům';
      case 'villa':
        return 'Vila';
      case 'land':
        return 'Pozemek';
      default:
        return type;
    }
  };

  const getAmenityText = (amenity: string) => {
    const amenityMap: Record<string, string> = {
      parking: 'Parkování',
      garden: 'Zahrada',
      terrace: 'Terasa',
      balcony: 'Balkon',
      pool: 'Bazén',
      air_conditioning: 'Klimatizace',
      fireplace: 'Krb',
      security_system: 'Bezpečnostní systém',
      wine_cellar: 'Vinný sklep',
      garage: 'Garáž',
      elevator: 'Výtah',
      mountain_view: 'Výhled na hory',
    };
    return amenityMap[amenity] || amenity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Nepodařilo se načíst nemovitost. <Link to="/properties" className="underline">Zpět na seznam</Link>
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
            <h1 className="text-2xl font-bold text-gray-900">
              {property.title}
            </h1>
            <p className="text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              {property.city}, {property.region}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(property.status)
          )}>
            {getStatusText(property.status)}
          </span>
          
          <Button variant="outline" size="sm">
            <ShareIcon className="h-4 w-4 mr-2" />
            Sdílet
          </Button>
          
          <Button asChild variant="outline" size="sm">
            <Link to={`/properties/${property.id}/edit`}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Upravit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            disabled={deleteProperty.isPending}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {deleteProperty.isPending ? 'Mazání...' : 'Smazat'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 mr-2" />
                Fotogalerie ({property.images.length})
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.slice(0, 6).map((image: any, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url || image}
                      alt={`${property.title} - obrázek ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                                         {image.isPrimary && (
                       <div className="absolute top-2 left-2">
                         <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                           Hlavní
                         </span>
                       </div>
                     )}
                  </div>
                ))}
                {property.images.length > 6 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg h-32">
                    <span className="text-gray-500">
                      +{property.images.length - 6} dalších
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Popis</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {property.description || 'Popis není k dispozici.'}
              </p>
            </div>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Vybavení</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.features.map((feature: string) => (
                  <div key={feature} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {getAmenityText(feature)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informace</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cena</label>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(property.price, property.currency)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Typ</label>
                  <p className="text-sm text-gray-900">{getTypeText(property.type)}</p>
                </div>
                
                {property.bedrooms !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ložnice</label>
                    <p className="text-sm text-gray-900">{property.bedrooms}</p>
                  </div>
                )}
                
                {property.bathrooms !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Koupelny</label>
                    <p className="text-sm text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                
                {property.area && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Velikost</label>
                    <p className="text-sm text-gray-900">{property.area} m²</p>
                  </div>
                )}
                
                {property.yearBuilt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rok výstavby</label>
                    <p className="text-sm text-gray-900">{property.yearBuilt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="text-sm text-gray-500">{property.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Vytvořeno</label>
                <p className="text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  {formatDate(property.createdAt)}
                </p>
              </div>
              
              {property.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aktualizováno</label>
                  <p className="text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    {formatDate(property.updatedAt)}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rychlé akce</h3>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to={`/properties/${property.id}/edit`}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Upravit nemovitost
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <ShareIcon className="h-4 w-4 mr-2" />
                Kopírovat odkaz
              </Button>
              
              <Button variant="outline" className="w-full">
                <EyeIcon className="h-4 w-4 mr-2" />
                Náhled na webu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Smazat nemovitost"
        description="Opravdu chcete smazat tuto nemovitost? Tato akce je nevratná."
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default PropertyDetailPage; 