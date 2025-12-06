'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, Mail, Scale, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed to our newsletter!');
      // Reset subscription status after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
              <li><a href="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Home</a></li>
              <li><a href="#features" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Features</a></li>
              <li><a href="#about" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Cookie Policy</a></li>
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
            <form onSubmit={handleSubscribe}>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled={isSubmitting || isSubscribed}
                  className="px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || isSubscribed}
                  className={`flex items-center justify-center gap-2 ${
                    isSubscribed 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : isSubscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} CovenAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Terms</a>
            <a href="/cookies" className="text-gray-400 hover:text-blue-600 text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;