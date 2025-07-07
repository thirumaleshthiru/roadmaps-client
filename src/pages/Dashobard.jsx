import React, { useEffect } from "react";
import { useAuth } from "../utils/AuthConext";
import { useNavigate } from "react-router-dom";
import { Title, Meta } from "react-head";
import { 
 
  Plus, 
  BookOpen, 
  Map, 
  Edit3, 
  Settings, 
  BookMarked,
  Library,
  ArrowRight 
} from "lucide-react";

function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const navigationItems = [
    { 
      name: "Add Concept", 
      path: "/addconcept", 
      description: "Create new learning concepts and materials",
      icon: <Plus />
    },
    { 
      name: "Add Roadmap", 
      path: "/addroadmap", 
      description: "Design new learning paths and roadmaps",
      icon: <Map />
    },
    { 
      name: "Add Blog", 
      path: "/addblog", 
      description: "Write and publish new blog articles",
      icon: <Edit3 />
    },
    { 
      name: "Add Resource", 
      path: "/addresource", 
      description: "Upload new learning resources and materials",
      icon: <BookOpen />
    },
    { 
      name: "Manage Concepts", 
      path: "/manageconcepts", 
      description: "Edit and organize existing learning concepts",
      icon: <Settings />
    },
    { 
      name: "Manage Roadmaps", 
      path: "/manageroadmaps", 
      description: "Update and maintain learning roadmaps",
      icon: <Map />
    },
    { 
      name: "Manage Blogs", 
      path: "/manageblogs", 
      description: "Edit and moderate blog content",
      icon: <BookMarked />
    },
    { 
      name: "Manage Resources", 
      path: "/manageresources", 
      description: "Organize and update learning resources",
      icon: <Library />
    }
  ];

  return (
    <>
      <Title>Admin Dashboard | Learning Hub</Title>
      <Meta name="description" content="Administrative dashboard for managing learning content and resources" />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Manage your learning content, roadmaps, and resources from one central location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {navigationItems.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 cursor-pointer relative overflow-hidden"
                role="button"
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    Admin
                  </span>
                  <div className="text-indigo-600">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {item.name}
                </h3>
                
                <p className="text-slate-600 mb-8 text-lg leading-relaxed line-clamp-3">
                  {item.description}
                </p>
                
                <button 
                  className="w-full px-6 py-4 bg-[#EB5A3C] text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-lg group-hover:bg-indigo-600"
                  aria-label={`Access ${item.name}`}
                >
                  <span>Access</span>
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;