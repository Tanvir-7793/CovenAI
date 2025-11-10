'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Activity, Menu, X, Home, FileSignature, LogOut, Search, Plus, ScanText, Calculator, DollarSign, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";
import { getUserDocumentStats, getRecentScannedDocuments, DocumentRecord } from '@/lib/firestore';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});
export default function Dashboard() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    generatedDocuments: 0,
    scannedDocuments: 0,
    documentsByType: {} as Record<string, number>,
    recentDocuments: [] as DocumentRecord[],
  });
  const [recentScanned, setRecentScanned] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Tools State
  const [stampDutyAmount, setStampDutyAmount] = useState('');
  const [stampDutyState, setStampDutyState] = useState('maharashtra');
  const [stampDutyResult, setStampDutyResult] = useState<number | null>(null);
  
  const [rentAmount, setRentAmount] = useState('');
  const [totalPersons, setTotalPersons] = useState('');
  const [rentSplitResult, setRentSplitResult] = useState<number | null>(null);
  
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [contractDuration, setContractDuration] = useState<{
    years: number;
    months: number;
    days: number;
  } | null>(null);

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

  // Fetch document statistics with real-time updates
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const documentStats = await getUserDocumentStats(user.uid);
        const scannedDocs = await getRecentScannedDocuments(user.uid, 5);
        
        setStats(documentStats);
        setRecentScanned(scannedDocs);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Show error message to user
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up real-time listener for document changes
    let unsubscribe: (() => void) | null = null;
    
    try {
      const documentsRef = collection(db, 'documents');
      // Try with orderBy first
      const q = query(
        documentsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        () => {
          console.log('Documents updated, refreshing stats...');
          fetchStats();
        },
        (error: any) => {
          console.error('Error in real-time listener:', error);
          // If orderBy fails, try without it
          if (error.code === 'failed-precondition' || error.code === 'permission-denied') {
            console.warn('Trying real-time listener without orderBy...');
            try {
              const q2 = query(
                documentsRef,
                where('userId', '==', user.uid)
              );
              unsubscribe = onSnapshot(
                q2,
                () => {
                  console.log('Documents updated (without orderBy), refreshing stats...');
                  fetchStats();
                },
                (fallbackError: any) => {
                  console.error('Fallback listener also failed:', fallbackError);
                }
              );
            } catch (fallbackErr) {
              console.error('Could not set up fallback listener:', fallbackErr);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Helper function to get time ago
  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  // Calculate contract duration
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      alert('End date must be after start date');
      return;
    }
    
    // Calculate years, months, and days properly
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    
    // Adjust for negative days
    if (days < 0) {
      months--;
      // Get the last day of the previous month
      const lastDayOfPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += lastDayOfPrevMonth;
    }
    
    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }
    
    setContractDuration({ years, months, days });
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
      />
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
                    alt="AI LegalDocs Logo" 
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
                alt="AI LegalDocs Logo" 
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
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              
              {/* Mobile Search Toggle and New Button */}
              <div className="flex items-center space-x-2 md:hidden">
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
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
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <a href="document-generator"><button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </button></a>
            </div>
          </div>
        </header>

        {/* Greeting */}
        <div className="px-6 pt-3 pb-1">
          <p className={`text-2xl font-medium text-gray-800 font-sans ${pacifico.className}`}>{greeting}, <span className="text-blue-600">{userName}</span>!</p>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                icon: FileText, 
                label: 'Total Documents', 
                value: loading ? '...' : stats.totalDocuments.toString(), 
                change: `${stats.generatedDocuments} generated, ${stats.scannedDocuments} scanned` 
              },
              { 
                icon: FileSignature, 
                label: 'Generated Documents', 
                value: loading ? '...' : stats.generatedDocuments.toString(), 
                change: Object.keys(stats.documentsByType).length > 0 
                  ? `${Object.keys(stats.documentsByType).length} document types` 
                  : 'No documents yet' 
              },
              { 
                icon: ScanText, 
                label: 'Scanned Documents', 
                value: loading ? '...' : stats.scannedDocuments.toString(), 
                change: recentScanned.length > 0 
                  ? `${recentScanned.length} recent scans` 
                  : 'No scans yet' 
              },
              { 
                icon: Activity, 
                label: 'Document Types', 
                value: loading ? '...' : Object.keys(stats.documentsByType).length.toString(), 
                change: Object.entries(stats.documentsByType).slice(0, 2).map(([type, count]) => 
                  `${type}: ${count}`
                ).join(', ') || 'No types yet' 
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Tools Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Tools</h2>
            <p className="text-gray-600 mb-6">Small tools for daily use</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stamp Duty Calculator */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Stamp Duty Calculator</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Calculate stamp duty for property transactions in India</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Value (₹)
                    </label>
                    <input
                      type="number"
                      value={stampDutyAmount}
                      onChange={(e) => setStampDutyAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={stampDutyState}
                      onChange={(e) => setStampDutyState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="maharashtra">Maharashtra</option>
                      <option value="delhi">Delhi</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="tamilnadu">Tamil Nadu</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="rajasthan">Rajasthan</option>
                      <option value="westbengal">West Bengal</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!stampDutyAmount) return;
                      const amount = parseFloat(stampDutyAmount);
                      // State-wise stamp duty rates (approximate)
                      const rates: Record<string, number> = {
                        maharashtra: 0.05, // 5%
                        delhi: 0.06, // 6%
                        karnataka: 0.05, // 5%
                        tamilnadu: 0.07, // 7%
                        gujarat: 0.049, // 4.9%
                        rajasthan: 0.05, // 5%
                        westbengal: 0.07, // 7%
                      };
                      const rate = rates[stampDutyState] || 0.05;
                      setStampDutyResult(amount * rate);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Calculate
                  </button>
                  
                  {stampDutyResult !== null && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Stamp Duty</p>
                      <p className="text-2xl font-bold text-blue-600">₹{stampDutyResult.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ({((stampDutyResult / parseFloat(stampDutyAmount)) * 100).toFixed(2)}% of property value)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rent Split Calculator */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Rent Split Calculator</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Calculate how much each person should pay</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Rent (₹)
                    </label>
                    <input
                      type="number"
                      value={rentAmount}
                      onChange={(e) => setRentAmount(e.target.value)}
                      placeholder="Enter total rent"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of People
                    </label>
                    <input
                      type="number"
                      value={totalPersons}
                      onChange={(e) => setTotalPersons(e.target.value)}
                      placeholder="Enter number of people"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!rentAmount || !totalPersons) return;
                      setRentSplitResult(parseFloat(rentAmount) / parseFloat(totalPersons));
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Calculate
                  </button>
                  
                  {rentSplitResult !== null && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Per Person</p>
                      <p className="text-2xl font-bold text-green-600">₹{rentSplitResult.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ({totalPersons} people sharing ₹{parseFloat(rentAmount).toLocaleString('en-IN')})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Duration Calculator */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Contract Duration</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Calculate the duration between two dates</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => {
                        setContractStartDate(e.target.value);
                        if (contractEndDate && e.target.value) {
                          calculateDuration(e.target.value, contractEndDate);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={contractEndDate}
                      onChange={(e) => {
                        setContractEndDate(e.target.value);
                        if (contractStartDate && e.target.value) {
                          calculateDuration(contractStartDate, e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!contractStartDate || !contractEndDate) return;
                      calculateDuration(contractStartDate, contractEndDate);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Calculate
                  </button>
                  
                  {contractDuration && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Duration</p>
                      <div className="mt-2 space-y-1">
                        {contractDuration.years > 0 && (
                          <p className="text-lg font-semibold text-purple-600">
                            {contractDuration.years} {contractDuration.years === 1 ? 'Year' : 'Years'}
                          </p>
                        )}
                        {contractDuration.months > 0 && (
                          <p className="text-lg font-semibold text-purple-600">
                            {contractDuration.months} {contractDuration.months === 1 ? 'Month' : 'Months'}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-purple-600">
                          {contractDuration.days} {contractDuration.days === 1 ? 'Day' : 'Days'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Total: {(() => {
                            const start = new Date(contractStartDate);
                            const end = new Date(contractEndDate);
                            const timeDiff = end.getTime() - start.getTime();
                            const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                            return totalDays.toLocaleString();
                          })()} days
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Loading documents...
                  </div>
                ) : (() => {
                  // Filter documents based on search query
                  const filteredDocuments = searchQuery.trim() 
                    ? stats.recentDocuments.filter((doc) => {
                        const searchLower = searchQuery.toLowerCase();
                        const titleMatch = doc.title?.toLowerCase().includes(searchLower);
                        const typeMatch = doc.documentType?.toLowerCase().includes(searchLower);
                        const typeLabelMatch = doc.type?.toLowerCase().includes(searchLower);
                        const languageMatch = doc.language?.toLowerCase().includes(searchLower);
                        return titleMatch || typeMatch || typeLabelMatch || languageMatch;
                      })
                    : stats.recentDocuments;
                  
                  return filteredDocuments.length > 0 ? (
                    filteredDocuments.slice(0, 5).map((doc) => {
                      const date = doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date();
                      const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      });
                      
                      return (
                        <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">{formattedDate}</p>
                                <span className="text-xs text-gray-400">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  doc.type === 'generated' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {doc.type === 'generated' ? 'Generated' : 'Scanned'}
                                </span>
                                {doc.documentType && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 capitalize">{doc.documentType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      {searchQuery.trim() 
                        ? `No documents found matching "${searchQuery}"` 
                        : 'No documents yet. Start by generating or scanning a document.'}
                    </div>
                  );
                })()}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <a href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all documents →
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Loading activity...
                  </div>
                ) : recentScanned.length > 0 ? (
                  recentScanned.map((doc) => {
                    const date = doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date();
                    const timeAgo = getTimeAgo(date);
                    
                    return (
                      <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            <ScanText className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              Scanned document {doc.simplifiedLanguage ? `(${doc.simplifiedLanguage.toUpperCase()})` : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No recent scans. Scan a document to see activity here.
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
