'use client';

import { motion } from 'framer-motion';
import { Twitter, Github, Mail, Scale } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/images/trial.png" 
                  alt="CovenAI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-blue-900">CovenAI</span>
            </div>
            <p className="text-gray-500 text-sm">
              Where Law Meets Automation
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Home</a></li>
              <li><a href="#features" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Features</a></li>
              <li><a href="#about" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-500 text-sm mb-3">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} CovenAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;