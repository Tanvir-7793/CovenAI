'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, Clock, CheckCircle, Activity, Menu, X, Home, FileSignature, Settings, LogOut, ChevronDown, ChevronRight, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});
export default function Dashboard() {
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

  // Auto-expand parent items when their children are active
  useEffect(() => {
    const newExpandedItems = { ...expandedItems };
    navItems.forEach(item => {
      if (item.children.some(child => pathname === child.href)) {
        newExpandedItems[item.name.toLowerCase()] = true;
      }
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const toggleItem = (item: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isChildActive = (children: { href: string }[]) => {
    return children.some(child => isActive(child.href));
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      href: '/dashboard',
      children: []
    },
    { 
      name: 'Documents', 
      icon: FileText, 
      href: '#',
      children: [
        { name: 'All Documents', href: '/documents' },
        { name: 'Shared with me', href: '/documents/shared' },
        { name: 'Recent', href: '/documents/recent' },
      ]
    },
    { 
      name: 'Templates', 
      icon: FileSignature, 
      href: '#',
      children: [
        { name: 'Legal Agreements', href: '/templates/agreements' },
        { name: 'Court Documents', href: '/templates/court' },
        { name: 'Business Contracts', href: '/templates/contracts' },
      ]
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      href: '/settings',
      children: []
    },
  ];

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
                {navItems.map((item) => (
                  <div key={item.name}>
                    <button
                      onClick={() => item.children.length ? toggleItem(item.name.toLowerCase()) : null}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.href) || (item.children.length && isChildActive(item.children))
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-5 w-5 mr-3 ${
                          isActive(item.href) || (item.children.length && isChildActive(item.children))
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.children.length > 0 && (
                        <ChevronRight 
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            expandedItems[item.name.toLowerCase()] ? 'transform rotate-90' : ''
                          }`}
                        />
                      )}
                    </button>
                    {item.children.length > 0 && expandedItems[item.name.toLowerCase()] && (
                      <div className="mt-1 space-y-1 pl-12">
                        {item.children.map((child) => {
                          const active = isActive(child.href);
                          return (
                            <a
                              key={child.name}
                              href={child.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                active
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                                  active ? 'bg-blue-600' : 'bg-transparent'
                                }`}></div>
                                {child.name}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
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
              {navItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => item.children.length ? toggleItem(item.name.toLowerCase()) : null}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href) || (item.children.length && isChildActive(item.children))
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 ${
                        isActive(item.href) || (item.children.length && isChildActive(item.children))
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.children.length > 0 && (
                      <ChevronDown 
                        className={`h-4 w-4 text-gray-500 transition-transform ${
                          expandedItems[item.name.toLowerCase()] ? 'transform rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {item.children.length > 0 && expandedItems[item.name.toLowerCase()] && (
                    <div className="mt-1 space-y-1 pl-12">
                      {item.children.map((child) => (
                        <a
                          key={child.name}
                          href={child.href}
                          className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                              isActive(child.href) ? 'bg-blue-600' : 'bg-transparent'
                            }`}></div>
                            {child.name}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
                New
              </button>
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
              { icon: FileText, label: 'Total Documents', value: '132', change: '+12% from last month' },
              { icon: Users, label: 'Active Clients', value: '28', change: '+3 this week' },
              { icon: Clock, label: 'Pending Reviews', value: '10', change: '-2 from yesterday' },
              { icon: CheckCircle, label: 'Approved Cases', value: '94', change: '5 awaiting signature' },
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

          {/* Recent Activity and Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { name: 'Rent Agreement - John Doe', status: 'Completed', date: 'Oct 30, 2023' },
                  { name: 'NDA - TechCorp Pvt Ltd', status: 'Pending Review', date: 'Oct 28, 2023' },
                  { name: 'Employment Contract - Sarah P.', status: 'Draft', date: 'Oct 25, 2023' },
                ].map((doc, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{doc.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : doc.status === 'Pending Review' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <a href="/documents" className="text-sm font-medium text-blue-600 hover:text-blue-500">
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
                {[
                  { 
                    icon: Activity, 
                    text: 'You reviewed the NDA for TechCorp.', 
                    time: '2h ago',
                    color: 'text-blue-500',
                    bg: 'bg-blue-50'
                  },
                  { 
                    icon: FileText, 
                    text: 'Generated new Rent Agreement for John Doe.', 
                    time: '5h ago',
                    color: 'text-green-500',
                    bg: 'bg-green-50'
                  },
                  { 
                    icon: CheckCircle, 
                    text: 'Approved Employment Contract.', 
                    time: '1d ago',
                    color: 'text-purple-500',
                    bg: 'bg-purple-50'
                  },
                ].map((activity, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${activity.bg} flex items-center justify-center mr-3`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
