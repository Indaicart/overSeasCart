import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  FolderIcon,
  TrophyIcon,
  ChartBarIcon,
  IdentificationIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const MyDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Documents', icon: FolderIcon },
    { key: 'certificates', label: 'Certificates', icon: TrophyIcon },
    { key: 'reports', label: 'Report Cards', icon: ChartBarIcon },
    { key: 'id_cards', label: 'ID Cards', icon: IdentificationIcon },
    { key: 'materials', label: 'Study Materials', icon: BookOpenIcon }
  ];

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const fetchMyDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDocuments = () => {
    if (activeCategory === 'all') return documents;
    return documents.filter(doc => doc.category === activeCategory);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'certificates':
        return <TrophyIcon className="w-6 h-6" />;
      case 'reports':
        return <ChartBarIcon className="w-6 h-6" />;
      case 'id_cards':
        return <IdentificationIcon className="w-6 h-6" />;
      case 'materials':
        return <BookOpenIcon className="w-6 h-6" />;
      default:
        return <DocumentTextIcon className="w-6 h-6" />;
    }
  };

  const handleDownload = (documentId, fileName) => {
    alert(`Downloading: ${fileName}`);
    // Implementation will include actual file download
  };

  const handleShare = (documentId) => {
    alert('Share functionality will be implemented');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const filteredDocuments = getFilteredDocuments();
  const certificatesCount = documents.filter(d => d.category === 'certificates').length;
  const reportsCount = documents.filter(d => d.category === 'reports').length;
  const idCardsCount = documents.filter(d => d.category === 'id_cards').length;
  const materialsCount = documents.filter(d => d.category === 'materials').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Documents
        </h1>
        <p className="text-gray-600 mt-2">Access your certificates, reports, and study materials</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates</p>
              <p className="text-3xl font-bold text-yellow-600">{certificatesCount}</p>
            </div>
            <TrophyIcon className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Report Cards</p>
              <p className="text-3xl font-bold text-blue-600">{reportsCount}</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ID Cards</p>
              <p className="text-3xl font-bold text-green-600">{idCardsCount}</p>
            </div>
            <IdentificationIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Study Materials</p>
              <p className="text-3xl font-bold text-purple-600">{materialsCount}</p>
            </div>
            <BookOpenIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            const count = category.key === 'all' 
              ? documents.length 
              : documents.filter(d => d.category === category.key).length;
            
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  activeCategory === category.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {category.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No documents in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  {/* Document Icon & Info */}
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      doc.category === 'certificates' ? 'bg-yellow-100 text-yellow-600' :
                      doc.category === 'reports' ? 'bg-blue-100 text-blue-600' :
                      doc.category === 'id_cards' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getCategoryIcon(doc.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {doc.title || 'Document Title'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {doc.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued: {new Date(doc.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Document Details */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {doc.file_type || 'PDF'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {doc.file_size || '2.5 MB'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(doc.id, doc.title)}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(doc.id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDocuments;
