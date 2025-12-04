import PageWrapper from "@/app/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Sparkles, Wand2, Cpu, BookOpen, Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-gray-900 to-emerald-900 text-white min-h-screen flex items-center">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[2px] bg-emerald-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-800/30 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-pulse border border-emerald-500/30">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-medium text-emerald-200">AI-Powered Learning</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-emerald-100">
                  CourseConstruct
                </span>
              </h1>
              
              {/* Subtitle */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-5xl text-emerald-100 mb-3">
                  AI-Generated Courses,
                </h2>
                <h3 className="text-2xl md:text-4xl text-emerald-200/80">
                  Personalized for You
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-lg text-emerald-100/80 mb-12 max-w-xl leading-relaxed">
                Generate custom learning paths instantly with artificial intelligence. 
                No predefined courses—just tell us what you want to learn, and our AI builds it for you.
              </p>

              {/* Single CTA Button - Links to workspace */}
              <div className="mb-16">
                <Link href="/workspace">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 group px-8 py-6 w-full sm:w-auto"
                  >
                    <Brain className="mr-3 h-5 w-5" />
                    See AI in Action
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* AI Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-emerald-800/50">
                <div className="text-center group hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-emerald-300 mb-1">∞</div>
                  <div className="text-emerald-200/70 text-sm">Course Possibilities</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-emerald-300 mb-1 flex items-center justify-center">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="text-emerald-200/70 text-sm">AI-Generated</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-emerald-300 mb-1">100%</div>
                  <div className="text-emerald-200/70 text-sm">Personalized</div>
                </div>
              </div>
            </div>

            {/* Right - AI Visualizer */}
            <div className="relative">
              {/* Main AI Visualization Card */}
              <div className="relative h-[550px] rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900/30 via-gray-900/50 to-emerald-800/30 border border-emerald-500/20 backdrop-blur-sm shadow-2xl shadow-emerald-900/30">
                {/* Animated Neural Network Lines */}
                <div className="absolute inset-0 opacity-40">
                  <svg className="w-full h-full" viewBox="0 0 400 550">
                    <path 
                      d="M50,100 C150,50 250,150 350,100" 
                      stroke="url(#gradient1)" 
                      strokeWidth="1.5" 
                      fill="none"
                      className="animate-dash"
                    />
                    <path 
                      d="M50,200 C150,150 250,250 350,200" 
                      stroke="url(#gradient2)" 
                      strokeWidth="1.5" 
                      fill="none"
                      className="animate-dash"
                      style={{animationDelay: '0.5s'}}
                    />
                    <path 
                      d="M50,300 C150,250 250,350 350,300" 
                      stroke="url(#gradient3)" 
                      strokeWidth="1.5" 
                      fill="none"
                      className="animate-dash"
                      style={{animationDelay: '1s'}}
                    />
                    
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                        <stop offset="50%" stopColor="#34d399" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0" />
                        <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Floating AI Elements */}
                <div className="absolute top-6 left-6 w-16 h-16 bg-emerald-500/10 backdrop-blur-sm rounded-2xl border border-emerald-400/20 flex items-center justify-center animate-float">
                  <Brain className="h-8 w-8 text-emerald-300" />
                </div>
                
                <div className="absolute bottom-6 right-6 w-20 h-20 bg-emerald-600/20 backdrop-blur-sm rounded-3xl border border-emerald-400/30 flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                  <Wand2 className="h-10 w-10 text-emerald-200" />
                </div>

                {/* Central Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  {/* AI Icon */}
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl shadow-emerald-500/40">
                    <Cpu className="h-16 w-16 text-white" />
                  </div>
                  
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-emerald-100 mb-3 bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                      AI Course Generator
                    </h3>
                    <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-emerald-400 mx-auto rounded-full"></div>
                  </div>
                  
                  {/* Status text */}
                  <div className="bg-emerald-900/40 backdrop-blur-md rounded-2xl border border-emerald-500/40 p-6 max-w-sm">
                    <p className="text-xl text-emerald-200 font-medium text-center">
                      Generating your personalized learning path...
                    </p>
                    
                    {/* Progress indicator */}
                    <div className="mt-4">
                      <div className="h-2 bg-emerald-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-progress w-3/4"></div>
                      </div>
                      <div className="flex justify-between text-sm text-emerald-300/70 mt-2">
                        <span>Processing</span>
                        <span>75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-emerald-950/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How <span className="text-emerald-300">CourseConstruct</span> Works
            </h2>
            <p className="text-lg text-emerald-200/70 max-w-2xl mx-auto">
              Three simple steps to your personalized AI-generated course
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20 transform -translate-y-1/2"></div>

            {[
              {
                step: "01",
                icon: <Brain className="h-10 w-10" />,
                title: "Describe Your Goal",
                desc: "Tell our AI what you want to learn. Be as specific or broad as you like."
              },
              {
                step: "02",
                icon: <Wand2 className="h-10 w-10" />,
                title: "AI Generates Course",
                desc: "Our AI instantly creates a complete learning path with modules, lessons, and projects."
              },
              {
                step: "03",
                icon: <Rocket className="h-10 w-10" />,
                title: "Start Learning",
                desc: "Begin your personalized course immediately. Track progress and get AI-powered recommendations."
              },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="relative bg-gradient-to-br from-gray-900/50 to-emerald-900/20 p-8 rounded-3xl border border-emerald-800/30 backdrop-blur-sm group hover:border-emerald-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/20"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                  {item.step}
                </div>
                
                <div className="w-16 h-16 bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <div className="text-emerald-300">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {item.title}
                </h3>
                
                <p className="text-emerald-200/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI-Powered Features
            </h2>
            <p className="text-lg text-emerald-200/70 max-w-2xl mx-auto">
              Everything you need for a personalized learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Dynamic Course Generation",
                desc: "Every course is unique, generated based on your specific learning goals"
              },
              {
                icon: <Wand2 className="h-8 w-8" />,
                title: "Instant Content Creation",
                desc: "Get comprehensive learning materials generated in seconds"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Progress Tracking",
                desc: "Monitor your learning journey with AI-powered insights"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Adaptive Learning Paths",
                desc: "Courses evolve based on your progress and understanding"
              },
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Interactive Modules",
                desc: "Engage with AI-generated quizzes and exercises"
              },
              {
                icon: <Cpu className="h-8 w-8" />,
                title: "Smart Recommendations",
                desc: "Get personalized suggestions for related topics"
              },
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-gray-900 to-emerald-900/20 p-8 rounded-2xl border border-emerald-800/30 hover:border-emerald-500/50 transition-all duration-300 group hover:translate-y-[-8px]"
              >
                <div className="w-14 h-14 bg-emerald-900/40 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-800/60 transition-colors duration-300">
                  <div className="text-emerald-300 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-emerald-200/70">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - With Generate AI Course Button */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-800/40 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-emerald-400/30">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            <span className="font-medium text-emerald-100">No Predefined Courses Needed</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to Learn Anything?
          </h2>
          
          <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-12">
            Generate your first AI-powered course in seconds. 
            The future of personalized learning starts here.
          </p>
          
          {/* Generate AI Course Button - Links to workspace */}
          <Link href="/workspace">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold px-12 py-7 text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 group"
            >
              <Brain className="mr-3 h-6 w-6" />
              Generate AI Course
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          
          <p className="text-emerald-300/60 mt-8 text-sm">
            No credit card required • Instant access • 100% personalized
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}