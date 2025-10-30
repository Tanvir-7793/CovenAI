"use client";

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center py-5 px-8 bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm"
    >
      <div className="flex items-center w-full">
        {/* Mobile Menu Button */}
        <div className="md:hidden mr-2">
          <button 
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src="/images/trial.png" 
            alt="AI LegalDocs Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-semibold text-blue-900">CovenAI</h1>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8 mr-12">
        <motion.a 
          href="#" 
          className="relative text-gray-700 font-medium hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Home
        </motion.a>
        <motion.a 
          href="#features" 
          className="relative text-gray-700 font-medium hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Features
        </motion.a>
        <motion.a 
          href="#about" 
          className=" relative text-gray-700 font-medium hover:text-blue-600 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          About
        </motion.a>
      </div>

      {/* Mobile Menu */}
      <div id="mobile-menu" className="hidden md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg py-4 px-8 z-50">
        <div className="flex flex-col space-y-4">
          <a 
            href="#" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            Home
          </a>
          <a 
            href="#features" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            Features
          </a>
          <a 
            href="#about" 
            className="text-gray-700 hover:text-blue-600 font-medium py-2"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            About
          </a>
        </div>
      </div>

      <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition">
        Login
      </button>
    </motion.nav>
  );
}
