'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";
import { Loader2, FileText, Users, Clock, CheckCircle, Activity, Menu, X, Home, FileSignature, Settings, LogOut, ChevronDown, ChevronRight, Search, Plus, FileScan as FileScanIcon, ScanText } from 'lucide-react';
import { saveDocumentScanning } from '@/lib/firestore';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

interface FormData {
  partyName: string;
  partyTitle: string;
  effectiveDate: string;
  additionalDetails: string;
}

export default function DocumentScanner() {
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
  const [image, setImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [simplifiedLanguage, setSimplifiedLanguage] = useState('auto');
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

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleExpand = (item: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!image) return;
    setLoading(true);
    setOcrText('');
    setSimplifiedText('');

    try {
      const res = await fetch('/api/simplify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, language: simplifiedLanguage }),
      });

      const data = await res.json();
      setOcrText(data.ocrText || 'No text found.');
      setSimplifiedText(data.simplifiedText || 'Could not simplify text.');
      
      // Save document scanning record
      if (user?.uid && data.ocrText) {
        const title = `Scanned Document - ${new Date().toLocaleDateString()}`;
        await saveDocumentScanning(
          user.uid,
          title,
          simplifiedLanguage !== 'auto' ? simplifiedLanguage : undefined
        );
      }
    } catch (error) {
      console.error(error);
      setSimplifiedText('Error occurred while processing the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30 -z-10"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        style={{ backgroundSize: '200% 200%' }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
      />

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col z-50"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${pacifico.variable} font-pacifico text-2xl text-blue-600`}>CovenAI</div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
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
      
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30">
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
                  <Menu className="h-5 w-5 text-gray-500" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Smart Document Reader</h1>
              </div>
              
              {/* Mobile Search Toggle and New Button */}
              <div className="flex items-center space-x-2 md:hidden">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Search className="h-5 w-5 text-gray-500" />
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
                New Scan
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Scanner & Simplifier</h1>
              <p className="text-gray-600">Upload your legal documents or images for text extraction and simplification</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document Image</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                    <div className="space-y-3">
                      <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Drop your document here or click to browse</p>
                        <p className="mt-1 text-sm text-gray-500">JPG, PNG, PDF (Max 10MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Select File
                      </label>
                    </div>
                  </div>
                  
                  {image && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full max-h-64 object-contain border rounded-md" 
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <label htmlFor="simplifiedLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                      Simplified Text Language
                    </label>
                    <select
                      id="simplifiedLanguage"
                      value={simplifiedLanguage}
                      onChange={(e) => setSimplifiedLanguage(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={loading}
                    >
                      <option value="auto">Auto (Same as input)</option>
                      <option value="en">English</option>
                      <option value="mr">Marathi</option>
                      <option value="hi">Hindi</option>
                      <option value="gu">Gujarati</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select the language for simplified text output. "Auto" will use the same language as the extracted text.
                    </p>
                  </div>

                  <button
                    onClick={handleProcessImage}
                    disabled={loading || !image}
                    className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-white flex items-center justify-center ${
                      loading || !image 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Scan & Simplify Document'
                    )}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Analysis Results</h2>
                
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Processing your document...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Extracted Text (OCR)
                      </h3>
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                        {ocrText || 'No text extracted yet. Upload a document to begin.'}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Simplified Text
                      </h3>
                      <div className="p-4 border border-gray-200 rounded-lg bg-green-50 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                        {simplifiedText || 'Simplified text will appear here after processing.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
