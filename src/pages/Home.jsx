import React from "react";
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  Brain, 
  Compass, 
  Book, 
  Library, 
  Star,
  ChevronRight,
  CheckCircle,
  Users,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-indigo-100 opacity-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-indigo-200 opacity-40 blur-3xl"></div>
          <svg className="absolute top-1/2 left-0 text-indigo-100 w-32 h-32 opacity-20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#7b7dfc" strokeWidth="8" fill="none" />
          </svg>
          <svg className="absolute bottom-10 right-10 text-indigo-100 w-48 h-48 opacity-20" viewBox="0 0 100 100">
            <rect x="10" y="10" width="80" height="80" rx="10" stroke="#7b7dfc" strokeWidth="8" fill="none" />
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center bg-white shadow-sm px-4 py-2 rounded-full mb-6">
                <span className="bg-indigo-50 text-xs font-semibold text-indigo-600 px-3 py-1 rounded-full mr-2">NEW</span>
                <span className="text-sm text-zinc-600">Expert Learning Paths</span>
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
                Build Skills with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Expert Roadmaps</span>
              </h1>
              
              <p className="text-zinc-600 text-lg mb-8 leading-relaxed">
                Master programming, data structures, design, and more with step-by-step learning paths.
                Our expert roadmaps help beginners and experts excel.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/roadmaps">
                  <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center gap-2 w-full justify-center sm:w-auto">
                    Explore Roadmaps
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                
                
              </div>
              
             
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-2 border border-zinc-100 transform -rotate-2 transition-all hover:rotate-0 duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl"></div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-100">
                    <img src="/assets/roadmaps-page.png" alt="Java Roadmap" className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
 

      {/* Features Section */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm mb-4">
              <Award className="w-4 h-4" />
              Premium Features
            </div>
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Roadmaps</h2>
            <p className="text-zinc-600">Our roadmaps provide structured learning experiences designed by industry experts to help you master new skills efficiently.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Compass className="w-10 h-10" />,
                title: "Step-by-Step Guidance",
                description: "Follow clear instructions and structured milestones to achieve your learning goals without confusion."
              },
              {
                icon: <Star className="w-10 h-10" />,
                title: "Expert Curated",
                description: "Our roadmaps are made by industry leaders with proven expertise in their fields."
              },
              {
                icon: <Brain className="w-10 h-10" />,
                title: "Diverse Learning Tracks",
                description: "Choose from programming, data science, design, and more to suit your career aspirations."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="mb-6 inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-24 relative bg-indigo-600 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="absolute -top-40 -left-40 text-white w-80 h-80 opacity-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
            <svg className="absolute bottom-0 right-0 text-white w-96 h-96 opacity-20" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" rx="20" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Explore Our Pages</h2>
            <p className="text-indigo-100">Discover resources to accelerate your learning journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Popular Roadmaps",
                description: "Discover our popular roadmaps designed to help you achieve your learning goals efficiently.",
                link: "/popular"
              },
              {
                icon: <Book className="w-8 h-8" />,
                title: "Blog",
                description: "Stay updated with the latest articles, tutorials, and tips on programming, design, and more.",
                link: "/blog"
              },
              {
                icon: <Library className="w-8 h-8" />,
                title: "Resources",
                description: "Access valuable resources, tools, and guides to enhance your learning experience.",
                link: "/resources"
              }
            ].map((page, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-6 border-b border-zinc-100">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 mb-4">
                    {page.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{page.title}</h3>
                  <p className="text-zinc-600 text-sm">{page.description}</p>
                </div>
                <a 
                  href={page.link}
                  className="block p-4 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span>Explore {page.title}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full opacity-80 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full opacity-80 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-2/5">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm mb-4">
                <Target className="w-4 h-4" />
                Learning Journey
              </div>
              <h2 className="text-3xl font-bold mb-6">Track Your Progress</h2>
              <p className="text-zinc-600 mb-8">Our platform is designed to help you track your learning journey and accomplish your goals efficiently with expertly crafted guidance.</p>
              
              <Link to="/roadmaps">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-all">
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            <div className="md:w-3/5">
              <div className="grid gap-4">
                {[
                  {
                    icon: <CheckCircle className="w-6 h-6" />,
                    title: "Progress Tracking",
                    description: "Monitor your learning journey with detailed progress tracking. Set milestones, track completed tasks, and visualize your growth."
                  },
                  {
                    icon: <Library className="w-6 h-6" />,
                    title: "Instant Resources",
                    description: "Access a vast library of curated learning materials instantly. From video tutorials to documentation, find everything you need."
                  },
                  {
                    icon: <Compass className="w-6 h-6" />,
                    title: "Step-by-Step Guidance",
                    description: "Never feel lost with our detailed step-by-step learning paths. Each concept is broken down into digestible chunks."
                  },
                  {
                    icon: <Brain className="w-6 h-6" />,  
                    title: "Smart Summaries",
                    description: "Get concise and insightful summaries of complex topics to accelerate your learning and retain key concepts effectively."
                  }
                ].map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 bg-zinc-50 p-6 rounded-2xl hover:shadow-md transition-all"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                      <p className="text-zinc-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-full opacity-40">
    <svg className="absolute top-0 left-0 text-indigo-200 w-32 h-32 opacity-50" viewBox="0 0 100 100">
      <path d="M30,10 L70,10 L90,30 L90,70 L70,90 L30,90 L10,70 L10,30 Z" stroke="#7b7dfc" strokeWidth="4" fill="none" />
    </svg>
    <svg className="absolute bottom-0 right-0 text-indigo-200 w-48 h-48 opacity-50" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="#7b7dfc" strokeWidth="4" fill="none" />
    </svg>
  </div>

  <div className="container mx-auto px-6 relative z-10">
    <div className="text-center max-w-2xl mx-auto mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm mb-4">
        <Users className="w-4 h-4" />
        Testimonials
      </div>
      <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
      <p className="text-zinc-600">Join thousands of satisfied learners who transformed their skills with our roadmaps</p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[
        {
          quote: "The structured approach of these roadmaps helped me transition into a full-stack developer role in just 6 months.",
          author: "Koushik",
          role: "Full-Stack Developer"
        },
        {
          quote: "I've tried many learning platforms, but the expert curation and clear milestones here made all the difference.",
          author: "Anand",
          role: "Data Scientist"
        },
        {
          quote: "The roadmaps provided exactly what I needed to fill the gaps in my knowledge and advance my career.",
          author: "Charan",
          role: "UX Designer"
        },
        {
          quote: "As someone switching careers, the clarity and structure of the roadmap gave me confidence and real progress week after week.",
          author: "Thirumalesh",
          role: "Frontend Developer"
        }
      ].map((testimonial, index) => (
        <div 
          key={index}
          className="bg-white p-8 rounded-3xl shadow-lg border border-zinc-100"
        >
          <div className="text-indigo-400 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.1 16.9C9.6 16.9 8.3 16.35 7.4 15.25C6.5 14.15 6 12.7 6 11C6 9.2 6.55 7.7 7.7 6.5C8.85 5.3 10.35 4.7 12.2 4.7C13.7 4.7 14.9 5.25 15.8 6.35C16.7 7.45 17.2 8.9 17.2 10.6C17.2 12.7 16.6 14.35 15.4 15.5C14.2 16.65 12.6 17.2 10.6 17.2L10.2 16.9H11.1Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-zinc-700 mb-6">{testimonial.quote}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {testimonial.author.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{testimonial.author}</div>
              <div className="text-sm text-zinc-500">{testimonial.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute -right-12 -bottom-12 text-white w-64 h-64 opacity-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
                <svg className="absolute -left-12 -top-12 text-white w-64 h-64 opacity-10" viewBox="0 0 100 100">
                  <rect x="10" y="10" width="80" height="80" rx="20" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </div>
              
              <div className="p-12 md:p-16 text-center relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Start Your Learning Journey Today</h2>
                <p className="text-indigo-100 mb-8 max-w-lg mx-auto">Join thousands of learners who are building their skills with our structured expert roadmaps.</p>
                
                <Link to="/roadmaps">
                  <button className="px-8 py-4 bg-white text-indigo-600 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto justify-center">
                    <span>Get Started Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Home;