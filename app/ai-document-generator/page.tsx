'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type FroalaEditorComponent from 'react-froala-wysiwyg';

// Import Froala Editor CSS
import './froala-editor.css';

// Define types for our form
type DocumentFormData = {
  documentType: string;
  userInputs: string;
  language: string;
};

// Dynamically import Froala Editor to avoid SSR issues
const FroalaEditor = dynamic(
  () => import('react-froala-wysiwyg').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        Loading editor...
      </div>
    )
  }
) as React.ComponentType<any>;

export default function AIDocumentGenerator() {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentType: '',
    userInputs: '',
    language: 'English',
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'nda', label: 'NDA (Non-Disclosure Agreement)' },
    { value: 'terms', label: 'Terms of Service' },
    { value: 'privacy', label: 'Privacy Policy' },
    { value: 'custom', label: 'Custom Document' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentType.trim() || !formData.userInputs) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Sending request with data:', formData);
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('API Response:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to generate document');
      }

      if (!responseData.content) {
        throw new Error('No content received from the API');
      }

      setGeneratedContent(responseData.content);
    } catch (err) {
      console.error('Error generating document:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}. Please check the console for more details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Legal Document Generator</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a document type</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="userInputs" className="block text-sm font-medium text-gray-700 mb-1">
                Document Details <span className="text-red-500">*</span>
              </label>
              <textarea
                id="userInputs"
                name="userInputs"
                value={formData.userInputs}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter all necessary details for the document..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide as much detail as possible for better results.
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isGenerating}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isGenerating ? 'Generating...' : 'Generate Document'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </form>
        </div>

        {generatedContent && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Generated Document</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent);
                    alert('Document copied to clipboard!');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${formData.documentType || 'document'}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Download as TXT
                </button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md">
              <FroalaEditor
                model={generatedContent}
                onModelChange={(content: string) => setGeneratedContent(content)}
                config={{
                  placeholderText: 'Your generated document will appear here...',
                  toolbarButtons: {
                    moreText: {
                      buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
                    },
                    moreParagraph: {
                      buttons: ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']
                    },
                    moreRich: {
                      buttons: ['insertLink', 'insertImage', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
                    },
                    moreMisc: {
                      buttons: ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help']
                    }
                  },
                  heightMin: 300,
                  heightMax: 500,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
