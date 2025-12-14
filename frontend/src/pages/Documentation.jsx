import React, { useState, useEffect } from 'react';
import {
  Zap,
  Film,
  Settings,
  GitBranch,
  Terminal,
  Download,
  Code,
  Layers,
  BarChart2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Heart,
  ThumbsUp,
  Menu,
  X,
} from 'lucide-react';

// Utility component for consistent documentation sections
const DocSection = ({ icon: Icon, title, id, children }) => (
  <div id={id} className="scroll-mt-24">
    <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 hover:border-purple-400/50 hover:bg-gray-800/50">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400 flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white break-words">
          {title}
        </h2>
      </div>
      <div className="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

// Component to render code blocks with Tailwind styling
const CodeBlock = ({ children, language = 'bash' }) => (
  <div className="my-4">
    <pre className="bg-black/70 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono border border-purple-500/30 shadow-inner">
      <div className="text-purple-300 mb-2">
        <span className="text-purple-500 font-bold">{language === 'bash' ? '$' : language}</span>
      </div>
      <code className="whitespace-pre">{children}</code>
    </pre>
  </div>
);

// Component for the technology stack table
const TechStackTable = () => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-hidden rounded-lg border border-purple-500/30">
        <table className="min-w-full divide-y divide-purple-500/30">
          <thead>
            <tr className="bg-purple-900/40">
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Component
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Technology
              </th>
              <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Key Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20 bg-gray-900/20">
            {[
              { comp: 'Backend', tech: 'FastAPI (Python)', role: 'High-performance API, LLM orchestration' },
              { comp: 'AI/Scripting', tech: 'Google Gemini', role: 'Context-aware story and script generation' },
              { comp: 'Storage', tech: 'Supabase', role: 'Cloud storage for extracted images/audio' },
              { comp: 'Video Rendering', tech: 'FFmpeg.wasm', role: 'Zero-cost, browser-based video creation' },
              { comp: 'Frontend', tech: 'React 19 + Vite', role: 'User interface and video generation client' },
              { comp: 'Deployment', tech: 'Google Cloud Run / Vercel', role: 'Serverless backend & edge frontend hosting' },
            ].map((item, index) => (
              <tr key={index} className="transition-colors duration-200 hover:bg-purple-900/20">
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 font-medium text-white text-xs sm:text-sm">
                  {item.comp}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-purple-300 text-xs sm:text-sm">
                  {item.tech}
                </td>
                <td className="hidden md:table-cell px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-gray-400 text-xs sm:text-sm">
                  {item.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Component for the Performance Metrics table
const PerformanceTable = () => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-hidden rounded-lg border border-purple-500/30">
        <table className="min-w-full divide-y divide-purple-500/30">
          <thead>
            <tr className="bg-purple-900/40">
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Metric
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Before
              </th>
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                After
              </th>
              <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-300">
                Improvement
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20 bg-gray-900/20">
            {[
              { metric: 'Backend Processing', before: '2+ hours', after: '2 minutes', improvement: '100x faster' },
              { metric: 'Video Generation', before: 'Backend (slow)', after: 'Browser (instant)', improvement: '∞ scalability' },
              { metric: 'Monthly Cost', before: '$20-50', after: 'Near $0', improvement: '100% savings' },
              { metric: 'User Wait Time', before: '2+ hours', after: '80 seconds', improvement: '90x faster' },
            ].map((item, index) => (
              <tr key={index} className="transition-colors duration-200 hover:bg-purple-900/20">
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 font-medium text-white text-xs sm:text-sm">
                  {item.metric}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-yellow-300 text-xs sm:text-sm">
                  {item.before}
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-green-400 font-bold text-xs sm:text-sm">
                  {item.after}
                </td>
                <td className="hidden lg:table-cell px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-purple-300 text-xs sm:text-sm">
                  {item.improvement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const DocumentationPage = () => {
  // isMobileMenuOpen and related logic removed
  const [activeSection, setActiveSection] = useState('');

  const navLinks = [
    { id: 'overview', title: 'Overview' },
    { id: 'features', title: 'Key Features' },
    { id: 'how-it-works', title: 'How It Works' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'tech-stack', title: 'Technology Stack' },
    { id: 'performance', title: 'Performance Metrics' },
  ];

  // Modified handleNavClick to simply scroll
  const handleNavClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Track active section on scroll
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
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* BACKGROUND ORBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-purple-800/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* TITLE SECTION */}
        <header className="text-center pt-4 sm:pt-8 pb-6 sm:pb-8 lg:pb-12">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl ml font-bold -mt-5 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-700 to-blue-950 px-4">
              GET STARTED WITH MANHWA AI 
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

        {/* Removed mobile menu button */}
        {/* <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-transparent transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          
          {/* NAVIGATION SIDEBAR - Made desktop-only and fixed position */}
          <nav 
            className={`
              hidden lg:block lg:col-span-1 lg:sticky lg:top-8 self-start
              z-40
              bg-gray-900/50 backdrop-blur-md
              lg:rounded-xl lg:rounded-2xl border border-purple-500/20 shadow-xl
              p-6
            `}
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
              <p>
                <strong>MANHWA AI</strong> is an innovative platform that transforms manga/manhwa PDF files into engaging narrated videos automatically. Using advanced AI technology, it extracts panels, generates contextual narration, creates professional voiceovers, and compiles everything into a polished video—all in minutes.
              </p>
              <div className="py-6 sm:py-8 px-4 sm:px-6 rounded-xl bg-purple-900/30 border border-purple-500/30">
                <p className="text-sm sm:text-base">
                  Perfect for content creators, manga enthusiasts, and anyone looking to bring static comics to life with minimal effort.
                </p>
              </div>
              <p>
                Whether you're creating content for YouTube, social media, or personal enjoyment, MANHWA AI handles the entire production pipeline automatically.
              </p>
            </DocSection>

            {/* FEATURES */}
            <DocSection id="features" icon={Film} title="Key Features">
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Automatic Panel Extraction
                  </h4>
                  <p className="text-sm text-gray-300">
                    Advanced OCR technology extracts individual panels from your manga PDFs with high accuracy, preserving image quality and text.
                  </p>
                </div>

                <div className="p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI-Powered Story Generation
                  </h4>
                  <p className="text-sm text-gray-300">
                    Google Gemini analyzes your manga's context, genre, and visual elements to create engaging, natural-sounding narration that captures the story's essence.
                  </p>
                </div>

                <div className="p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Professional Text-to-Speech
                  </h4>
                  <p className="text-sm text-gray-300">
                    High-quality voice synthesis with natural intonation and pacing, perfectly synchronized with panel transitions.
                  </p>
                </div>

                <div className="p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    Dynamic Video Compilation
                  </h4>
                  <p className="text-sm text-gray-300">
                    Browser-based video rendering with smooth animations (pan, zoom, fade) creates a cinematic viewing experience without any server load.
                  </p>
                </div>

                <div className="p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Lightning-Fast Processing
                  </h4>
                  <p className="text-sm text-gray-300">
                    From upload to finished video in approximately 5 minutes. Backend processing completes in under 2 minutes, with browser-side compilation taking the remainder.
                  </p>
                </div>
              </div>
            </DocSection>

            {/* HOW IT WORKS */}
            <DocSection id="how-it-works" icon={GitBranch} title="How It Works">
              <p>
                MANHWA AI uses a <strong>Hybrid Processing Model</strong> that splits the workload between powerful backend servers and your browser for optimal performance.
              </p>
              
              
              <div className="my-6 space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Upload Your Manga PDF</h4>
                    <p className="text-sm text-gray-300">Simply drag and drop your manga file. Provide the title and genre for better AI context.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Automatic Panel Extraction</h4>
                    <p className="text-sm text-gray-300">Our backend processes the PDF, extracting individual panels while preserving image quality.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">AI Story Generation</h4>
                    <p className="text-sm text-gray-300">Google Gemini analyzes each panel and generates contextual narration that matches the tone and genre.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Voice Synthesis</h4>
                    <p className="text-sm text-gray-300">High-quality text-to-speech converts the narration into natural-sounding audio with perfect timing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Video Compilation</h4>
                    <p className="text-sm text-gray-300">Your browser compiles everything into a polished MP4 video with smooth animations and transitions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm sm:text-base">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Download & Share</h4>
                    <p className="text-sm text-gray-300">Download your finished video and share it on YouTube, social media, or anywhere you like!</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-black/60 border border-purple-500/30 rounded-lg">
                <p className="text-xs sm:text-sm text-purple-200 text-center italic">
                  The entire process is automated—no video editing skills required!
                </p>
              </div>
            </DocSection>

            {/* GETTING STARTED */}
            <DocSection id="getting-started" icon={Terminal} title="Getting Started">
              <h3 className="text-lg sm:text-xl font-semibold text-white mt-4">Step 1: Prepare Your Manga</h3>
              <p>
                Ensure your manga is in PDF format. The quality of the PDF directly affects the output quality. Higher resolution PDFs produce better results.
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-1 text-xs sm:text-sm mt-2">
                <li>Supported format: PDF only</li>
                <li>Recommended resolution: 300 DPI or higher</li>
                <li>File size limit: Check the upload interface for current limits</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold text-white mt-6">Step 2: Upload and Configure</h3>
              <p>
                Navigate to the upload page and provide the necessary information:
              </p>
              <div className="my-4 p-4 bg-gray-800/40 rounded-lg border border-purple-500/20">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span><strong>Manga Title:</strong> Enter the exact title for better AI understanding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span><strong>Genre:</strong> Select or enter the genre (Action, Romance, Fantasy, etc.) to help the AI match the narrative tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span><strong>PDF File:</strong> Upload your manga PDF file</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-white mt-6">Step 3: Processing</h3>
              <p>
                Once uploaded, the system will begin processing. You'll see real-time progress updates:
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-1 text-xs sm:text-sm mt-2">
                <li>Panel extraction progress</li>
                <li>AI script generation status</li>
                <li>Audio synthesis progress</li>
                <li>Video compilation status</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold text-white mt-6">Step 4: Preview and Download</h3>
              <p>
                After processing completes, you can preview your video directly in the browser. If satisfied, download the final MP4 file to your device.
              </p>

              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-yellow-300">Tip:</strong> The video compilation happens in your browser using FFmpeg.wasm. Keep the browser tab open during this process for best results.
                  </span>
                </p>
              </div>
            </DocSection>

            {/* TECH STACK */}
            <DocSection id="tech-stack" icon={Settings} title="Technology Stack">
              <p>
                MANHWA AI is built with cutting-edge technologies to deliver fast, reliable, and cost-effective video generation.
              </p>
              <TechStackTable />
              <div className="mt-4 p-3 sm:p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-yellow-300">Why Browser-Based Rendering?</strong> Using <strong className="text-purple-300">FFmpeg.wasm</strong> eliminates expensive server-side video processing, making the service scalable and cost-effective while delivering instant results.
                  </span>
                </p>
              </div>
            </DocSection>

            {/* PERFORMANCE */}
            <DocSection id="performance" icon={BarChart2} title="Performance Metrics">
              <p>
                Through continuous optimization, we've achieved remarkable performance improvements that benefit every user.
              </p>
              <PerformanceTable />
              <div className="mt-4 p-3 sm:p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-300 flex items-start gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Total Processing Time:</strong> Approximately 5 minutes from upload to finished video. Backend AI processing completes in under 2 minutes, with browser-based video compilation taking the remaining time.
                  </span>
                </p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-300 mb-2">Speed</h4>
                  <p className="text-xs sm:text-sm text-gray-300">100x faster than traditional methods with parallel processing</p>
                </div>
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">Scalability</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Infinite scalability through client-side rendering</p>
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