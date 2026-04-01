"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Mail, MapPin, Clock, User, MessageSquare, Building, 
  Menu, X, Home, FileSignature, LogOut, Scale, Search, Plus, ScanIcon 
} from "lucide-react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

export default function NotaryConsultingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("mahesh-patil");
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    email: "",
    address: "",
    caseType: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const notaryDepartments = [
    {
      id: "mahesh-patil",
      name: "Notary Ad. Mahesh Patil",
      address: "Hem Empire, Raviwar Peth Rd, Powai Naka, Satara, Maharashtra 415001",
      phone: "02162 234567",
      mobile: "098226 77644",
      whatsapp: "9822677644",
      email: "mahesh.patil.notary@gmail.com",
      altEmail: "contact@maheshpatil.com",
      hours: "Monday - Saturday: 10:00 AM - 7:00 PM",
      officer: "Ad. Mahesh Patil (Notary Public)"
    },
    {
      id: "tejaswini-patil",
      name: "Advocate & Notary Shrimati Tejaswini Patil",
      address: "41, Hem Empire Ground Floor, in front of Tahasildar Office, Satara, Maharashtra 415001",
      phone: "02162 234567",
      mobile: "098500 07980",
      whatsapp: "9850007980",
      email: "tejaswini.patil.notary@gmail.com",
      altEmail: "contact@tejaswinipatil.com",
      hours: "Monday - Saturday: 9:30 AM - 6:30 PM",
      officer: "Shrimati Tejaswini Patil (Advocate & Notary)"
    },
    {
      id: "jt-mulla",
      name: "Advocates and Notary public Adv J.T.Mulla",
      address: "gala no. 41, infront of tahasil office, Hem Empire, near Powai naka, near Tahasil office, Powai Naka, Satara, Maharashtra 415001",
      phone: "02162 234567",
      mobile: "099757 38834",
      whatsapp: "9975738834",
      email: "jt.mulla.notary@gmail.com",
      altEmail: "contact@jtmulla.com",
      hours: "Monday - Saturday: 10:00 AM - 7:00 PM",
      officer: "Adv J.T.Mulla (Advocate & Notary Public)"
    },
    {
      id: "tejasvi-chavan",
      name: "Adv. Tejasvi Chavan",
      address: "1014, Shaniwar Peth Rd, Guruwar Peth, Satara, Maharashtra 415002",
      phone: "02162 234567",
      mobile: "098900 20011",
      whatsapp: "9890020011",
      email: "tejasvi.chavan.adv@gmail.com",
      altEmail: "contact@tejasvichavan.com",
      hours: "Monday - Saturday: 10:00 AM - 6:00 PM",
      officer: "Adv. Tejasvi Chavan (Advocate)"
    }
  ];

  const currentDepartment = notaryDepartments.find(dept => dept.id === selectedDepartment) || notaryDepartments[0];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userName');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({
        name: "",
        contactNumber: "",
        email: "",
        address: "",
        caseType: "",
        message: ""
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col z-50 shadow-2xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8">
                  <img src="/images/trial.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-bold text-blue-800">CovenAI</h2>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-4 space-y-1">
                <a href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Home className="h-5 w-5 mr-3 text-gray-500" /> Dashboard
                </a>
                <a href="/document-generator" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <FileSignature className="h-5 w-5 mr-3 text-gray-500" /> AI Document Generator
                </a>
                <a href="/document-scanner" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <ScanIcon className="h-5 w-5 mr-3 text-gray-500" /> Smart Document Reader
                </a>
                <a href="/notary-consulting" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
                  <Scale className="h-5 w-5 mr-3 text-gray-500" /> Notary Consulting
                </a>
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <button onClick={handleSignOut} className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="h-5 w-5 mr-3" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
            <div className="w-8 h-8">
              <img src="/images/trial.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-blue-800">CovenAI</h2>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-4">
            <nav className="px-4 space-y-1">
              <a href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Home className="h-5 w-5 mr-3 text-gray-500" /> Dashboard
              </a>
              <a href="/document-generator" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <FileSignature className="h-5 w-5 mr-3 text-gray-500" /> AI Document Generator
              </a>
              <a href="/document-scanner" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <ScanIcon className="h-5 w-5 mr-3 text-gray-500" /> Smart Document Reader
              </a>
              <a href="/notary-consulting" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
                <Scale className="h-5 w-5 mr-3 text-gray-500" /> Notary Consulting
              </a>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button onClick={handleSignOut} className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
              <LogOut className="h-5 w-5 mr-3" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={toggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Notary Consulting</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="/document-generator" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                <Plus className="h-4 w-4 mr-2" /> New Document
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Page Title & Intro */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${pacifico.className}`}>Expert Notary Consulting</h2>
              <p className="text-gray-600 max-w-2xl">
                Choose a department and request a consultation for your legal documentation needs in Satara District.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
              {/* Left Column: Department List */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Building className="mr-2 text-blue-600 w-5 h-5" />
                      Select Department
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
                    {notaryDepartments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDepartment(dept.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                          selectedDepartment === dept.id
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div className={`font-bold transition-colors ${selectedDepartment === dept.id ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"}`}>
                          {dept.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{dept.address.split(',')[0]}</div>
                        <div className="mt-3 flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-500">
                          <User className="w-3 h-3 mr-1" /> {dept.officer.split('(')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services Card */}
                <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -m-4 w-24 h-24 bg-blue-500 rounded-full blur-2xl group-hover:bg-blue-400 transition-colors" />
                  <h3 className="text-xl font-bold mb-6 relative z-10">Available Services</h3>
                  <ul className="space-y-4 relative z-10">
                    {[
                      "Document Notarization",
                      "Affidavit Preparation",
                      "Legal Verification",
                      "Property Attestation",
                      "Power of Attorney"
                    ].map((service, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium">
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full mr-3" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Details & Form */}
              <div className="lg:col-span-8 space-y-8">
                {/* Department Details Card */}
                <motion.div
                  key={selectedDepartment}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Scale className="mr-3 text-blue-600 w-7 h-7" />
                      {currentDepartment.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Office</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MapPin className="w-5 h-5" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                          <p className="text-sm font-medium text-gray-800 leading-relaxed mt-1">{currentDepartment.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Clock className="w-5 h-5" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Timing</p>
                          <p className="text-sm font-medium text-gray-800 mt-1">{currentDepartment.hours}</p>
                          <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">Sundays Closed</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-bold text-gray-900">{currentDepartment.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Mobile:</span>
                        <span className="font-bold text-gray-900">{currentDepartment.mobile}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">WhatsApp:</span>
                        <span className="font-bold text-green-600">{currentDepartment.whatsapp}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Official Email</p>
                        <p className="text-sm font-bold text-blue-600 truncate">{currentDepartment.email}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Consultation Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <MessageSquare className="mr-3 text-blue-600 w-6 h-6" />
                      Consultation Request
                    </h3>
                  </div>
                  
                  <div className="p-8">
                    {submitStatus === "success" && (
                      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 text-green-800">
                        <div className="bg-green-100 p-2 rounded-full"><Plus className="w-4 h-4 rotate-45" /></div>
                        <p className="text-sm font-bold">Request received! We'll contact you shortly.</p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Contact Number *</label>
                          <input
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="+91..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Service Required *</label>
                        <select
                          name="caseType"
                          value={formData.caseType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none appearance-none"
                        >
                          <option value="">Choose a category</option>
                          <option value="notarization">Notarization</option>
                          <option value="affidavit">Affidavit</option>
                          <option value="property">Property Document</option>
                          <option value="poa">Power of Attorney</option>
                          <option value="other">General Consultation</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Case Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                          placeholder="Tell us about your requirements..."
                        />
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-blue-800 uppercase tracking-widest">
                          <Building className="w-4 h-4" />
                          Submitting to {currentDepartment.name.split(' ')[0]}
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Send Request"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
