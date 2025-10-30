"use client";

import { motion } from "framer-motion";
import { main } from "framer-motion/client";
import { FileText, Brain, ScanText, Languages, FolderOpen, User } from "lucide-react";

export default function HomeHero() {
  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "AI Document Generator",
      desc: "Create legal drafts instantly based on user inputs using Gemini AI."
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "AI Review & Simplify",
      desc: "Let AI simplify and clarify complex legal text for better understanding."
    },
    {
      icon: <ScanText className="w-8 h-8 text-blue-600" />,
      title: "OCR Integration",
      desc: "Scan and digitize physical legal documents into editable text."
    },
    {
      icon: <Languages className="w-8 h-8 text-blue-600" />,
      title: "Multi-language Support",
      desc: "Translate or simplify content into Indian regional languages."
    },
    {
      icon: <FolderOpen className="w-8 h-8 text-blue-600" />,
      title: "Document Storage & Management",
      desc: "Organize, track, and manage all your legal documents securely."
    },
    {
      icon: <User className="w-8 h-8 text-blue-600" />,
      title: "User Dashboard",
      desc: "Track created, reviewed, and shared documents with AI insights."
    }
  ];

  // Floating document component for background
  const FloatingDocument = ({ delay = 0, size = 100, className = '' }) => (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, rotate: -5 }}
      animate={{
        y: [0, 20, 0],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-10"
      >
        <rect x="5" y="10" width="90" height="120" rx="2" fill="#1E40AF" />
        <rect x="20" y="30" width="60" height="4" rx="2" fill="#93C5FD" />
        <rect x="20" y="45" width="50" height="3" rx="1.5" fill="#93C5FD" />
        <rect x="20" y="55" width="70" height="3" rx="1.5" fill="#93C5FD" />
        <rect x="20" y="65" width="40" height="3" rx="1.5" fill="#93C5FD" />
      </svg>
    </motion.div>
  );

  return (
    <main className="flex flex-col items-center text-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #1E40AF 1px, transparent 1px),
                linear-gradient(to bottom, #1E40AF 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        
        {/* Floating Documents */}
        <FloatingDocument delay={0} size={120} className="top-1/4 left-1/6" />
        <FloatingDocument delay={0.5} size={80} className="top-1/3 right-1/5" />
        <FloatingDocument delay={1} size={100} className="bottom-1/4 left-1/4" />
        <FloatingDocument delay={1.5} size={60} className="bottom-1/3 right-1/3" />
        
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-blue-200/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      </div>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20  md:py-20 max-w-7xl w-full relative">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-left md:w-1/2 space-y-6"
        >
          <div className="space-y-2">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              AI-Powered Legal Documentation Assistant
            </motion.h1>
            <motion.div
              className="text-blue-600 font-medium text-lg md:text-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
                {/* “Covenant” (agreement) + “AI” (intelligence). */}
              by <span className="font-bold text-blue-900">CovenAI</span>
            </motion.div>
          </div>
          <motion.p 
            className="text-gray-700 text-lg max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Easily create, review, and manage legal documents with intelligent AI suggestions and automated workflows.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mt-7 md:mt-0 flex justify-center"
        >
          <img
            src="images/hero_image.png"
            alt="AI Document Illustration"
            className="w-80 md:w-96 drop-shadow-xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 w-full relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-12 text-center"
        >
          Key Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white/80 backdrop-blur-sm hover:bg-white border border-blue-100 rounded-2xl shadow-sm p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* About Section */}
      <section id="about" className="py-20 w-full relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-sm p-8 md:p-10 text-center md:text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            
            <motion.h2 
              className="text-3xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              About <span className="font-semibold text-blue-900">CovenAI</span>
            </motion.h2>
            
            <div className="space-y-6">
              <motion.p 
                className="text-lg text-gray-700 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <strong className="font-semibold text-blue-900">CovenAI</strong> is an AI-powered legal documentation platform designed to make legal drafting, review, and management effortless for everyone — from individuals to enterprises.
              </motion.p>
              
              <motion.p 
                className="text-lg text-gray-700 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: true }}
              >
                We combine cutting-edge <span className="text-blue-600 font-semibold">AI intelligence</span> with simple, intuitive tools to automate the most time-consuming parts of legal work.
              </motion.p>

              <motion.p 
                className="text-lg text-gray-700 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Whether you're creating a rent agreement, an NDA, or an affidavit, CovenAI understands your intent, generates accurate legal drafts,
                and simplifies complex clauses into plain language — ensuring clarity, accuracy, and compliance.
              </motion.p>

              <motion.p 
                className="text-lg text-gray-600 leading-relaxed mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                viewport={{ once: true }}
              >
                With built-in OCR, multi-language support, and secure cloud storage powered by <strong>Firebase</strong>,
                CovenAI is more than a tool — it's your intelligent legal partner that learns and evolves with you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                {/* Add any content here if needed */}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
