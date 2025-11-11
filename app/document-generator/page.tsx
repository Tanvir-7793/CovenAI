'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";
import dynamic from 'next/dynamic';
import { Loader2, FileText, Users, Clock, CheckCircle, Activity, Menu, X, Home, FileSignature, Settings, LogOut, ChevronDown, ChevronRight, Search, Plus, FileScanIcon, ScanText } from 'lucide-react';
import { saveDocumentGeneration } from '@/lib/firestore';

// Add these imports for DOCX generation
// Import for PDF generation
// html2pdf will be dynamically imported in the component to avoid SSR issues

// Import Froala Editor CSS
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});


// Dynamically import Froala Editor with SSR disabled
const FroalaEditor = dynamic(
  async () => {
    const FroalaEditorComponent = (await import('react-froala-wysiwyg')).default;
    
    // Import required Froala Editor plugins and styles
    if (typeof window !== 'undefined') {
      await import('froala-editor/js/plugins.pkgd.min');
    }
    
    return FroalaEditorComponent;
  },
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

const documentTemplates = [
  { id: 'nda', name: 'Non-Disclosure Agreement' },
  { id: 'rent', name: 'Rent Agreement' },
  { id: 'partnership', name: 'Partnership Agreement' },
  
  { id: 'employment', name: 'Employment Contract' },
  { id: 'lease', name: 'Lease Agreement' },
  { id: 'service', name: 'Service Agreement' },
  { id: 'custom', name: 'Custom Document' },
] as const;

export default function DocumentGenerator() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    documents: false,
    templates: false,
  });
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const router = useRouter();
  const [documentType, setDocumentType] = useState<string>('');
  const [language, setLanguage] = useState('en');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    partyName: '',
    partyTitle: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    additionalDetails: '',
  });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userName');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get user's name from localStorage or use email prefix as fallback
    const storedName = localStorage.getItem('userName') || 
                      user?.displayName || 
                      user?.email?.split('@')[0] || 
                      'there';
    setUserName(storedName);

    // Set time-based greeting
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateDocument = async () => {
    if (!documentType) return;

    setIsGenerating(true);
    setDocumentContent(''); // Clear previous content

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentType, formData, userName, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setDocumentContent(content);
      }

      // Save document generation record
      if (user?.uid && documentType) {
        const documentTitles: Record<string, string> = {
          'nda': 'Non-Disclosure Agreement',
          'rent': 'Rent Agreement',
          'partnership': 'Partnership Agreement',
          'employment': 'Employment Contract',
          'lease': 'Lease Agreement',
          'service': 'Service Agreement',
          'custom': 'Custom Document',
        };
        
        const title = `${documentTitles[documentType] || documentType} - ${formData.partyName || 'New Document'}`;
        
        await saveDocumentGeneration(
          user.uid,
          documentType,
          title,
          language || 'en',
          {
            partyName: formData.partyName,
            effectiveDate: formData.effectiveDate,
          }
        );
      }

    } catch (error) {
      console.error('Error generating document:', error);
      setDocumentContent('Error generating document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelChange = (model: string) => {
    setDocumentContent(model);
  };

  // Add type for form data
  interface FormData {
    partyName: string;
    partyTitle: string;
    effectiveDate: string;
    additionalDetails: string;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleExpand = (item: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-blue-200/20 -z-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      ></motion.div>
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col z-50`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex-shrink-0">
                  <img 
                    src="/images/trial.png" 
                    alt="CovenAI Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-blue-800">CovenAI</h2>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-4 space-y-1">
                <a
                  href="/dashboard"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    pathname === '/dashboard' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Home className="h-5 w-5 mr-3 text-gray-500" />
                  Dashboard
                </a>
                <a
                  href="/document-generator"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    pathname === '/document-generator' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <FileSignature className="h-5 w-5 mr-3 text-gray-500" />
                   AI Document Generator
                </a>
                <a
                  href="/document-scanner"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    pathname === '/document-scanner' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <FileSignature className="h-5 w-5 mr-3 text-gray-500" />
                   Smart Document Reader
                </a>
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
            <div className="w-8 h-8 flex-shrink-0">
              <img 
                src="/images/trial.png" 
                alt="CovenAI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-blue-800">CovenAI</h2>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              <a
                href="/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/dashboard' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Home className="h-5 w-5 mr-3 text-gray-500" />
                Dashboard
              </a>
              <a
                href="/document-generator"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/document-generator' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <FileSignature className="h-5 w-5 mr-3 text-gray-500" />
                AI Document Generator
              </a>
              <a
                href="/document-scanner"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/document-scanner' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ScanText className="h-5 w-5 mr-3 text-gray-500" />
                Smart Document Reader
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 space-y-3 md:space-y-0">
            {/* Left side - Menu and Title */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleSidebar}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">AI - Document Generator</h1>
              </div>
              
              {/* Mobile Search Toggle and New Button */}
              <div className="flex items-center space-x-2 md:hidden">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Search className="h-5 w-5 text-gray-600" />
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium flex items-center">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Desktop Search and New Button */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </button>
            </div>
          </div>
        </header>

        {/* Greeting */}
        <div className="px-6 pt-3 pb-1">
          <p className={`text-2xl font-medium text-gray-800 font-sans ${pacifico.className}`}>
            {greeting}, <span className="text-blue-600">{userName}</span>!
          </p>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Document Configuration */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Document Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a document type</option>
                  {documentTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
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
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="mr">Marathi</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>

              <div>
                <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Party Name
                </label>
                <input
                  type="text"
                  id="partyName"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  placeholder="Enter party name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="partyTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Party Title
                </label>
                <input
                  type="text"
                  id="partyTitle"
                  name="partyTitle"
                  value={formData.partyTitle}
                  onChange={handleInputChange}
                  placeholder="Enter party title"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  placeholder="Enter any additional details or requirements"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                />
              </div>

              <button
                onClick={generateDocument}
                disabled={!documentType || isGenerating}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  !documentType || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  'Generate Document'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Document Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold mb-4">Document Editor</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <FroalaEditor
                tag="div"
                model={documentContent}
                onModelChange={handleModelChange}
                config={{
                  placeholderText: 'Your generated document will appear here. Fill out the form and click "Generate Document" to get started.',
                  heightMin: 500,
                  heightMax: '100%',
                  toolbarSticky: true,
                  toolbarStickyOffset: 70,
                  toolbarVisibleWithoutSelection: true,
                  toolbarButtons: {
                    moreText: {
                      buttons: [
                        'bold', 'italic', 'underline', 'strikeThrough',
                        'subscript', 'superscript', 'fontSize', 'textColor',
                        'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'
                      ]
                    },
                    moreParagraph: {
                      buttons: [
                        'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
                        'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle',
                        'lineHeight', 'outdent', 'indent', 'quote'
                      ]
                    },
                    moreRich: {
                      buttons: [
                        'insertLink', 'insertImage', 'insertTable', 'emoticons',
                        'fontAwesome', 'specialCharacters', 'embedly', 'insertHR'
                      ]
                    },
                    moreMisc: {
                      buttons: [
                        'undo', 'redo', 'fullscreen', 'print', 'getPDF',
                        'spellChecker', 'selectAll', 'html', 'help'
                      ],
                      align: 'right',
                      buttonsVisible: 2
                    }
                  }
                }}
              />
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Draft
              </button>
              <button
                onClick={async () => {
                  if (!documentContent) {
                    alert('Please generate a document first');
                    return;
                  }

                  try {
                    // Create a temporary div to hold the content
                    const element = document.createElement('div');
                    element.innerHTML = `
                      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                        <h1 style="text-align: center; color: #1a365d; margin-bottom: 30px;">
                          ${documentType ? documentType.toUpperCase() : 'DOCUMENT'}
                        </h1>
                        <div style="line-height: 1.6; font-size: 14px;">
                          ${documentContent}
                        </div>
                        <div style="margin-top: 50px; text-align: right; font-size: 12px; color: #666;">
                          <p>Generated on: ${new Date().toLocaleDateString()}</p>
                          <p>Generated by: ${userName || 'CovenAI'}</p>
                        </div>
                      </div>
                    `;

                    // Generate PDF
                    const opt = {
                      margin: 10,
                      filename: `${documentType || 'document'}-${new Date().toISOString().split('T')[0]}.pdf`,
                      image: { type: 'jpeg' as const, quality: 0.98 },
                      html2canvas: { scale: 2 },
                      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                    };

                    // Dynamically import html2pdf and generate PDF
                    const html2pdf = (await import('html2pdf.js')).default;
                    await html2pdf().set(opt).from(element).save();

                  } catch (error) {
                    console.error('Error generating PDF:', error);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
  );
}
