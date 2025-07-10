import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogForm } from '../components/forms/BlogForm';

const BlogFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/blog');
  };

  const handleCancel = () => {
    navigate('/blog');
  };

  return (
    <BlogForm
      blogPostId={id}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default BlogFormPage; 