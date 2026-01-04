import React, { useState, useEffect } from 'react';
import {
  Zap,
  Film,
  GitBranch,
  Terminal,
  Code,
  Layers,
  AlertTriangle,
  Clock,
  Upload,
  PlayCircle,
  Download,
  Settings,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

// Utility component for consistent documentation sections
const DocSection = ({ icon: Icon, title, id, children }) => (
  <div id={id} className="scroll-mt-24">
    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500 hover:border-purple-400/60 hover:shadow-purple-500/20 hover:shadow-2xl">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-300 to-white">
          {title}
        </h2>
      </div>
      <div className="space-y-4 sm:space-y-5 text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('');

  const navLinks = [
    { id: 'overview', title: 'Overview' },
    { id: 'features', title: 'Key Features' },
    { id: 'how-it-works', title: 'How It Works' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'tips', title: 'Tips & Best Practices' },
  ];

  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.id);
      const scrollPosition = window.scrollY + 150;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen -mt-10 text-white overflow-hidden">


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-6 sm:py-8 lg:py-10">

        {/* TITLE SECTION */}
        <header className="text-center pt-4 sm:pt-8 pb-6 sm:pb-8 lg:pb-12">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl font-bold -mt-5 bg-clip-text text-transparent bg-white px-4">
              GET STARTED
            </h1>
          </div>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide px-4 max-w-4xl mx-auto">
            Transform Manga PDFs into Stunning Narrated Videos with AI
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-yellow-400 px-4">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-center">Powered by Gemini, FFmpeg.wasm, and FastAPI</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">

          {/* NAVIGATION SIDEBAR - Desktop only, fixed position */}
          <nav
            className="hidden lg:block lg:col-span-1 lg:sticky lg:top-8 self-start z-40 bg-gray-900/50 backdrop-blur-md lg:rounded-xl lg:rounded-2xl border border-purple-500/20 shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-7 lg:mb-4">
              <h3 className="text-md sm:text-xl font-bold text-purple-400 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Quick Navigation
              </h3>
            </div>
            <div className="space-y-2">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`
                    block w-full text-left px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200
                    ${activeSection === link.id
                      ? 'bg-purple-900/50 text-purple-300 border-l-4 border-purple-400'
                      : 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/30'
                    }
                  `}
                >
                  {link.title}
                </button>
              ))}
            </div>
          </nav>

          {/* DOCUMENTATION CONTENT */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12 lg:space-y-16">

            {/* OVERVIEW */}
            <DocSection id="overview" icon={Zap} title="Overview">
              <p className="text-base sm:text-lg leading-relaxed">
                <strong className="text-purple-300">MANHWA AI</strong> is an innovative platform that transforms manga and manhwa PDF files into engaging narrated videos automatically. Using advanced AI technology, it extracts panels, generates contextual narration, creates professional voiceovers, and compiles everything into a polished video—all in minutes.
              </p>
              <div className="py-6 sm:py-8 px-5 sm:px-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/40 shadow-xl">
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed">
                  Perfect for content creators, manga enthusiasts, and anyone looking to bring static comics to life with minimal effort. Whether you're creating content for YouTube, social media, or personal enjoyment, MANHWA AI handles the entire production pipeline automatically.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-purple-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Fully Automated</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-purple-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-purple-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-sm font-medium">Lightning Fast</span>
                </div>
              </div>
            </DocSection>

            {/* FEATURES */}
            <DocSection id="features" icon={Film} title="Key Features">
              <div className="grid grid-cols-1 gap-5 sm:gap-6">
                <div className="group p-5 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/40 rounded-2xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                      <Code className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2">Automatic Panel Extraction</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        Advanced OCR technology extracts individual panels from your manga PDFs with high accuracy, preserving image quality and text content perfectly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-5 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/40 rounded-2xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2">AI-Powered Story Generation</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        Google Gemini analyzes your manga's context, genre, and visual elements to create engaging, natural-sounding narration that captures the story's essence.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-5 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/40 rounded-2xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                      <Terminal className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2">Professional Text-to-Speech</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        High-quality voice synthesis with natural intonation and pacing, perfectly synchronized with panel transitions for a cinematic experience.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-5 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/40 rounded-2xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                      <Film className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2">Dynamic Video Compilation</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        Browser-based video rendering with smooth animations (pan, zoom, fade) creates a cinematic viewing experience with professional polish.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-5 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/40 rounded-2xl border border-purple-500/30 transition-all duration-300 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                      <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-semibold text-purple-300 mb-2">Lightning-Fast Processing</h4>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        From upload to finished video in approximately 5 minutes. Experience the fastest manga-to-video conversion available today.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* HOW IT WORKS */}
            <DocSection id="how-it-works" icon={GitBranch} title="How It Works">
              <p className="text-base sm:text-lg leading-relaxed mb-8">
                MANHWA AI uses a <strong className="text-purple-300">Hybrid Processing Model</strong> that combines powerful backend AI processing with efficient browser-based video compilation for optimal performance.
              </p>

              <div className="space-y-5 sm:space-y-6">
                {[
                  {
                    num: 1,
                    icon: Upload,
                    title: 'Upload Your Manga PDF',
                    desc: 'Simply drag and drop your manga file. Provide the title and genre for better AI context and narration quality.'
                  },
                  {
                    num: 2,
                    icon: Code,
                    title: 'Automatic Panel Extraction',
                    desc: 'Our backend processes the PDF, extracting individual panels while preserving image quality and maintaining proper sequence.'
                  },
                  {
                    num: 3,
                    icon: Sparkles,
                    title: 'AI Story Generation',
                    desc: 'Google Gemini analyzes each panel and generates contextual narration that matches the tone, genre, and visual content.'
                  },
                  {
                    num: 4,
                    icon: Terminal,
                    title: 'Voice Synthesis',
                    desc: 'High-quality text-to-speech converts the narration into natural-sounding audio with perfect timing and emotion.'
                  },
                  {
                    num: 5,
                    icon: PlayCircle,
                    title: 'Video Compilation',
                    desc: 'Your browser compiles everything into a polished MP4 video with smooth animations, transitions, and professional effects.'
                  },
                  {
                    num: 6,
                    icon: Download,
                    title: 'Download & Share',
                    desc: 'Download your finished video and share it on YouTube, TikTok, Instagram, or any platform you choose!'
                  }
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-4 sm:gap-5 group">
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-400 flex items-center justify-center font-bold text-lg sm:text-xl lg:text-2xl transition-shadow">
                        {step.num}
                      </div>
                      <div className="absolute top-3 left-3 w-6 h-6 sm:w-7 sm:h-7 bg-purple-400/20 rounded-full blur-sm"></div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-purple-400" />
                        <h4 className="font-semibold text-white text-base sm:text-lg">{step.title}</h4>
                      </div>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 sm:p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/40 rounded-2xl shadow-xl">
                <p className="text-sm sm:text-base text-purple-200 text-center leading-relaxed">
                  <Sparkles className="w-5 h-5 inline-block mr-2" />
                  <strong>The entire process is fully automated</strong> — no video editing skills or technical knowledge required!
                </p>
              </div>
            </DocSection>

            {/* GETTING STARTED */}
            <DocSection id="getting-started" icon={Terminal} title="Getting Started">
              <div className="space-y-8">

                {/* Step 1 */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/30 rounded-2xl p-6 sm:p-8 border border-purple-500/30 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 overflow-visible">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/50">
                      <span className="text-xl font-bold">1</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-white leading-normal pb-1">
                      Prepare Your Manga
                    </h3>
                  </div>

                  <p className="mb-4 text-gray-300 leading-relaxed">
                    Ensure your manga is in PDF format. The quality of the PDF directly affects the output quality. Higher resolution PDFs produce better results.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="p-4 bg-gray-900/50 rounded-xl border border-purple-500/20">
                      <div className="text-purple-400 font-semibold mb-1 text-sm">Format</div>
                      <div className="text-white text-sm">PDF Only</div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-xl border border-purple-500/20">
                      <div className="text-purple-400 font-semibold mb-1 text-sm">Resolution</div>
                      <div className="text-white text-sm">300 DPI+</div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-xl border border-purple-500/20">
                      <div className="text-purple-400 font-semibold mb-1 text-sm">Quality</div>
                      <div className="text-white text-sm">High Recommended</div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/30 rounded-2xl p-6 sm:p-8 border border-purple-500/30 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 overflow-visible">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/50">
                      <span className="text-xl font-bold">2</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-white leading-normal pb-1">
                      Upload and Configure
                    </h3>
                  </div>

                  <p className="mb-6 text-gray-300 leading-relaxed">
                    Navigate to the upload page and provide the necessary information:
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/30 rounded-2xl p-6 sm:p-8 border border-purple-500/30 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 overflow-visible">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/50">
                      <span className="text-xl font-bold">3</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-white leading-normal pb-1">
                      Monitor Processing
                    </h3>
                  </div>

                  <p className="mb-6 text-gray-300 leading-relaxed">
                    Once uploaded, the system will begin processing. You'll see real-time progress updates.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/30 rounded-2xl p-6 sm:p-8 border border-purple-500/30 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 overflow-visible">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/50">
                      <span className="text-xl font-bold">4</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-semibold text-white leading-normal pb-1">
                      Preview and Download
                    </h3>
                  </div>

                  <p className="mb-6 text-gray-300 leading-relaxed">
                    Preview your generated video and download the final MP4 file.
                  </p>
                </div>

              </div>
            </DocSection>



            {/* TIPS & BEST PRACTICES */}
            <DocSection id="tips" icon={Settings} title="Tips & Best Practices">
              <p className="text-base sm:text-lg leading-relaxed mb-6">
                Get the most out of MANHWA AI with these expert tips and recommendations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-300 text-lg">PDF Quality Matters</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Use high-resolution PDFs (300 DPI or higher) for best results. Clear, sharp images lead to better panel extraction and more accurate AI narration.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-purple-300 text-lg">Accurate Genre Selection</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Choose the correct genre to help AI generate narration that matches the story's tone. Action stories get dynamic narration, romance gets emotional depth.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl border border-green-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-600/30 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-green-300 text-lg">Keep Tab Active</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    During video compilation, keep your browser tab active and don't close it. Background processing may slow down or pause on some browsers.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-2xl border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-600/30 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-orange-400" />
                    </div>
                    <h4 className="font-semibold text-orange-300 text-lg">Stable Internet Connection</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Ensure a stable internet connection during upload and processing. Interruptions may cause the process to restart or fail.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-gradient-to-br from-pink-900/30 to-pink-800/20 rounded-2xl border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-600/30 flex items-center justify-center">
                      <Film className="w-4 h-4 text-pink-400" />
                    </div>
                    <h4 className="font-semibold text-pink-300 text-lg">Preview Before Download</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Always preview your video before downloading. Check the narration sync, transitions, and overall quality to ensure satisfaction.
                  </p>
                </div>

                <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 rounded-2xl border border-indigo-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center">
                      <Code className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h4 className="font-semibold text-indigo-300 text-lg">Page Count Optimization</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    For best results, process manga with 10-15 pages at a time. Very large files may take longer and require more browser resources.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/30 border border-purple-500/40 rounded-2xl">
                <h4 className="font-semibold text-purple-300 text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Pro Tips for Content Creators
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">Add background music after downloading to enhance viewer engagement</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">Create series by processing multiple chapters and maintaining consistent naming</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">Use the generated videos as base content and add your own commentary or edits</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">Test different genres and titles to see how AI adapts narration style</p>
                  </div>
                </div>
              </div>
            </DocSection>

          </div>
        </div>



      </div>
    </main>
  );
};

export default DocumentationPage;