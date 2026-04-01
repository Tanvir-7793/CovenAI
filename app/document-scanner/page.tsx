'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";
import { Loader2, FileText, Users, Clock, CheckCircle, Activity, Menu, X, Home, FileSignature, Settings, LogOut, ChevronDown, ChevronRight, Search, Plus, FileScan as FileScanIcon, ScanIcon, Volume2, VolumeX, Scale } from 'lucide-react';
import { saveDocumentScanning } from '@/lib/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [extractionSource, setExtractionSource] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [ttsError, setTtsError] = useState('');
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
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const cameraUploadRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      setTtsSupported(true);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
    setErrorMessage('');
    setOcrText('');
    setSimplifiedText('');

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setImage(null);
      setFileType('');
      setFileName('');
      setErrorMessage('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setFileType(file.type);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!image) return;
    setLoading(true);
    setOcrText('');
    setSimplifiedText('');
    setErrorMessage('');
    setExtractionSource('');

    try {
      let extractedText = '';
      let detectedSource = '';

      const processImageResponse = await fetch('/api/process-image', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('fileData', image);
          formData.append('fileType', fileType || 'image/jpeg');
          formData.append('fileName', fileName || 'upload');
          return formData;
        })(),
      });

      if (processImageResponse.ok) {
        const processData = await processImageResponse.json();
        extractedText = processData.text || '';
        if (extractedText) {
          detectedSource = 'OCR via process-image';
        }
      }

      const simplifyPayload = extractedText
        ? { text: extractedText, language: simplifiedLanguage }
        : { image, language: simplifiedLanguage };

      const simplifyResponse = await fetch('/api/simplify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simplifyPayload),
      });

      const data = await simplifyResponse.json();

      if (!simplifyResponse.ok) {
        throw new Error(data.error || `Request failed with status ${simplifyResponse.status}`);
      }

      const finalOcrText = data.ocrText || extractedText || 'No text found.';
      setOcrText(finalOcrText);
      if (!detectedSource && data.ocrText) {
        detectedSource = 'OCR via simplify-text';
      }
      setExtractionSource(detectedSource);
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
      const errorMessage = error instanceof Error ? error.message : 'Error occurred while processing the image.';
      setSimplifiedText(errorMessage);
      setOcrText('');
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resolveSpeechLang = () => {
    const map: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
    };

    if (simplifiedLanguage !== 'auto' && map[simplifiedLanguage]) {
      return map[simplifiedLanguage];
    }

    if (/[\u0900-\u097F]/.test(simplifiedText)) return 'hi-IN';
    if (/[\u0A80-\u0AFF]/.test(simplifiedText)) return 'gu-IN';
    return 'en-IN';
  };

  const handleSpeakSimplifiedText = async () => {
    if (!ttsSupported || !simplifiedText || simplifiedText === 'Simplified text will appear here after processing.') {
      return;
    }
    setTtsError('');

    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const cleanedText = simplifiedText.replace(/[#*_`>-]/g, ' ').replace(/\s+/g, ' ').trim();
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanedText,
          language: simplifiedLanguage !== 'auto' ? simplifiedLanguage : resolveSpeechLang().slice(0, 2),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setTtsError('Audio playback failed. Please try again.');
        URL.revokeObjectURL(audioUrl);
      };
      await audio.play();
      setIsSpeaking(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not convert text to speech.';
      setTtsError(message);
      setIsSpeaking(false);
    } finally {
      setIsGeneratingAudio(false);
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
                <div className="w-8 h-8 flex-shrink-0">
                  <img 
                    src="/images/trial.png" 
                    alt="AI LegalDocs Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-blue-800">CovenAI</h2>
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
                   <ScanIcon className="h-5 w-5 mr-3 text-gray-500" />
                  Smart Document Reader
                </a>
                <a
                  href="/notary-consulting"
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    pathname === '/notary-consulting'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Scale className="h-5 w-5 mr-3 text-gray-500" />
                  Notary Consulting
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
                 <ScanIcon className="h-5 w-5 mr-3 text-gray-500" />
                Smart Document Reader
              </a>
              <a
                href="/notary-consulting"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  pathname === '/notary-consulting'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Scale className="h-5 w-5 mr-3 text-gray-500" />
                Notary Consulting
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
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Upload Document Image</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">Drop your document here or click to browse</p>
                        <p className="mt-1 text-sm text-gray-500">JPG, PNG, PDF (Max 10MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        ref={fileUploadRef}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                        id="camera-upload"
                        ref={cameraUploadRef}
                      />
                      <button
                        type="button"
                        onClick={() => fileUploadRef.current?.click()}
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      >
                        Select File
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraUploadRef.current?.click()}
                        className="inline-flex items-center ml-3 px-6 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      >
                        Take Picture
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {image && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">Document Preview</h3>
                      {fileType === 'application/pdf' ? (
                        <div className="p-4 bg-white border border-blue-300 rounded-md text-sm text-blue-900">
                          PDF selected: <span className="font-medium">{fileName || 'document.pdf'}</span>
                        </div>
                      ) : (
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full max-h-64 object-contain border border-blue-300 rounded-md bg-white p-2"
                        />
                      )}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label htmlFor="simplifiedLanguage" className="block text-sm font-semibold text-gray-900 mb-3">
                      Output Language
                    </label>
                    <select
                      id="simplifiedLanguage"
                      value={simplifiedLanguage}
                      onChange={(e) => setSimplifiedLanguage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white transition-colors"
                      disabled={loading}
                    >
                      <option value="auto">Auto (Same as input)</option>
                      <option value="en">English</option>
                      <option value="mr">Marathi</option>
                      <option value="hi">Hindi</option>
                      <option value="gu">Gujarati</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-600">
                      Select the language for simplified text output. "Auto" will use the same language as the extracted text.
                    </p>
                  </div>

                  <button
                    onClick={handleProcessImage}
                    disabled={loading || !image}
                    className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center text-base transition-all ${
                      loading || !image
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
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
                      <div className="flex items-center mb-4">
                        <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Extracted Text (OCR)</h3>
                      </div>
                      {extractionSource && (
                        <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          Source: {extractionSource}
                        </div>
                      )}
                      <div className="p-6 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 max-h-96 overflow-y-auto">
                        <div className={`text-base leading-relaxed font-sans ${ocrText && ocrText !== 'No text extracted yet. Upload a document to begin.' ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                          {ocrText && ocrText !== 'No text extracted yet. Upload a document to begin.' ? (
                            <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {ocrText}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            'No text extracted yet. Upload a document to begin.'
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-4">
                        <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Simplified Text</h3>
                        <button
                          type="button"
                          onClick={handleSpeakSimplifiedText}
                          disabled={!ttsSupported || isGeneratingAudio || !simplifiedText || simplifiedText === 'Simplified text will appear here after processing.'}
                          className={`ml-auto inline-flex items-center px-3 py-1.5 text-xs rounded-md border transition-colors ${
                            !ttsSupported || isGeneratingAudio || !simplifiedText || simplifiedText === 'Simplified text will appear here after processing.'
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isSpeaking
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {isSpeaking ? <VolumeX className="h-3.5 w-3.5 mr-1" /> : <Volume2 className="h-3.5 w-3.5 mr-1" />}
                          {isGeneratingAudio ? 'Generating Voice...' : isSpeaking ? 'Stop Audio' : 'Listen'}
                        </button>
                      </div>
                      {!ttsSupported && (
                        <p className="mb-3 text-xs text-gray-500">Text-to-speech is not supported in this browser.</p>
                      )}
                      {ttsError && (
                        <p className="mb-3 text-xs text-red-600">{ttsError}</p>
                      )}
                      <div className="p-6 border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-green-50/50 max-h-96 overflow-y-auto">
                        <div className={`text-base leading-relaxed font-sans ${simplifiedText && simplifiedText !== 'Simplified text will appear here after processing.' ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                          {simplifiedText && simplifiedText !== 'Simplified text will appear here after processing.' ? (
                            <div className="prose prose-sm md:prose-base max-w-none text-gray-800">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {simplifiedText}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            'Simplified text will appear here after processing.'
                          )}
                        </div>
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
