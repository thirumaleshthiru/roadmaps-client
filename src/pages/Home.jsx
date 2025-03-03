import React, { useEffect } from "react";
import Footer from "../components/Footer";
import AOS from 'aos';
import "aos/dist/aos.css";
import { ArrowRight, BookOpen, Target, Brain, Compass, Book, Library, Star } from "lucide-react";

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-900 to-violet-800 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900 opacity-20"></div> {/* Replaced image with a solid color */}
        <div className="container mx-auto px-6 relative" data-aos="fade-up">
          <div className="max-w-4xl mx-auto text-center">
            <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-400/20 text-indigo-100 border border-indigo-400/30 mb-6 inline-block">
              Your Learning Journey Starts Here
            </span>
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Build Your Path with <span className="text-orange-400">Expert Roadmaps</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-12 leading-relaxed">
              Master programming, data structures, design, and more with step-by-step learning paths. 
              Our expert roadmaps are designed for beginners and experts alike to help you excel.
            </p>
            <button className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 transform hover:scale-105">
              Explore Roadmaps
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Our Roadmaps?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the benefits of our carefully crafted learning paths
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Compass className="w-8 h-8" />,
                title: "Step-by-Step Guidance",
                description: "Follow clear instructions and structured milestones to achieve your learning goals without confusion."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Expert Curated",
                description: "Our roadmaps are made by industry leaders with proven expertise in their fields."
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Diverse Learning Tracks",
                description: "Choose from programming, data science, design, and more to suit your career aspirations."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Pages Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Explore Our Pages
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover all the resources we offer to support your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Popular Roadmaps",
                description: "Discover our popular roadmaps designed to help you achieve your learning goals efficiently.",
                link: "/popular"
              },
              {
                icon: <Book className="w-6 h-6" />,
                title: "Blog",
                description: "Stay updated with the latest articles, tutorials, and tips on programming, design, and more.",
                link: "/blog"
              },
              {
                icon: <Library className="w-6 h-6" />,
                title: "Resources",
                description: "Access valuable resources, tools, and guides to enhance your learning experience.",
                link: "/resources"
              }
            ].map((page, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-indigo-600">
                    {page.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{page.title}</h3>
                </div>
                <p className="text-slate-600 mb-8">{page.description}</p>
                <a 
                  href={page.link}
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Your Learning Journey
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Track your progress and achieve your goals step by step
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "Progress Tracking",
                description: "Monitor your learning journey with detailed progress tracking. Set milestones, track completed tasks, and visualize your growth.",
                color: "bg-indigo-600"
              },
              {
                icon: <Library className="w-6 h-6" />,
                title: "Instant Resources",
                description: "Access a vast library of curated learning materials instantly. From video tutorials to documentation, find everything you need.",
                color: "bg-violet-600"
              },
              {
                icon: <Compass className="w-6 h-6" />,
                title: "Step-by-Step Guidance",
                description: "Never feel lost with our detailed step-by-step learning paths. Each concept is broken down into digestible chunks.",
                color: "bg-orange-500"
              },
              {
                icon: <Brain className="w-6 h-6" />,  
                title: "Smart Summaries",
                description: "Get concise and insightful summaries of complex topics to accelerate your learning and retain key concepts effectively.",
                color: "bg-green-500"  
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="flex gap-6 items-start"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={`w-12 h-12 rounded-xl ${step.color} text-white flex items-center justify-center shrink-0`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 
    </div>
  );
};

export default Home;