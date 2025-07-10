import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useInquiry, useUpdateInquiry } from '../hooks/useApi';
import type { Inquiry } from '../types';

const InquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const { data: inquiry, isLoading: loading, error } = useInquiry(id!);
  const updateInquiryMutation = useUpdateInquiry();

  const handleStatusChange = async (newStatus: Inquiry['status']) => {
    if (!inquiry) return;
    
    try {
      await updateInquiryMutation.mutateAsync({
        id: inquiry.id,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
    }
  };

  const handleReply = async () => {
    if (!inquiry || !replyMessage.trim()) return;
    
    try {
      // In a real app, you would send the reply via email API here
      console.log('Sending reply:', replyMessage);
      
      // Update inquiry status to "RESPONDED"
      await updateInquiryMutation.mutateAsync({
        id: inquiry.id,
        data: { status: 'RESPONDED' }
      });
      
      setReplyMessage('');
      setIsReplying(false);
      
      // Show success message
      alert('Odpověď byla odeslána!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Chyba při odesílání odpovědi');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'Nová';
      case 'IN_PROGRESS':
        return 'Zpracovává se';
      case 'RESPONDED':
        return 'Odpovězeno';
      case 'CLOSED':
        return 'Uzavřená';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Chyba</h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || 'Poptávka nebyla nalezena'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/inquiries"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět na poptávky
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Poptávka #{inquiry.id}
            </h1>
            <p className="text-sm text-gray-500">
              Přijato {formatDate(inquiry.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
            {getStatusText(inquiry.status)}
          </span>
          
          <select
            value={inquiry.status}
            onChange={(e) => handleStatusChange(e.target.value as Inquiry['status'])}
            className="rounded-md border-gray-300 text-sm"
            disabled={updateInquiryMutation.isPending}
          >
            <option value="NEW">Nová</option>
            <option value="IN_PROGRESS">Zpracovává se</option>
            <option value="RESPONDED">Odpovězeno</option>
            <option value="CLOSED">Uzavřená</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Informace o zákazníkovi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Jméno</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:text-blue-800">
                    {inquiry.email}
                  </a>
                </p>
              </div>
              
              {inquiry.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:text-blue-800">
                      {inquiry.phone}
                    </a>
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Typ poptávky</label>
                <p className="mt-1 text-sm text-gray-900">
                  {inquiry.type === 'PROPERTY' ? 'Nemovitost' : 'Obecné'}
                </p>
              </div>
            </div>
          </div>

          {/* Property Info */}
          {inquiry.property && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Nemovitost
              </h2>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{inquiry.property.title}</h3>
                <p className="text-sm text-gray-600">{inquiry.property.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {inquiry.property.city}, {inquiry.property.region}
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Zpráva od zákazníka
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
            </div>
          </div>

          {/* Reply Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Odpovědět zákazníkovi
              </h2>
              
              {!isReplying && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Napsat odpověď
                </button>
              )}
            </div>
            
            {isReplying && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaše odpověď
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Napište svou odpověď zákazníkovi..."
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || updateInquiryMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateInquiryMutation.isPending ? 'Odesílá se...' : 'Odeslat odpověď'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsReplying(false);
                      setReplyMessage('');
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Rychlé akce</h3>
            
            <div className="space-y-3">
              <a
                href={`mailto:${inquiry.email}`}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Otevřít v emailu
              </a>
              
              {inquiry.phone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Zavolat
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Časová osa</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Poptávka přijata</p>
                  <p className="text-xs text-gray-500">{formatDate(inquiry.createdAt)}</p>
                </div>
              </div>
              
              {inquiry.updatedAt !== inquiry.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Poslední aktualizace</p>
                    <p className="text-xs text-gray-500">{formatDate(inquiry.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage; 