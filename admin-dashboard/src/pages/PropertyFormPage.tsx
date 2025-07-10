import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyForm } from '@/components/forms/PropertyForm';

const PropertyFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/properties');
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  return (
    <PropertyForm
      propertyId={id}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default PropertyFormPage; 