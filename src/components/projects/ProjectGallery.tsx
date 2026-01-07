// Project Gallery - UI DEMO MODE
// All backend functionality removed - only authentication remains active

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Grid, List, Loader2 } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  lastEdited: Date;
  previewImage?: string;
  generationId?: string;
}

interface ProjectGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectGallery = ({ isOpen, onClose }: ProjectGalleryProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // UI Demo Mode - no backend functionality
      console.log('UI Demo: Project gallery opened');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // No projects in demo mode
      setProjects([]);
    } catch (error) {
      toast.error("Failed to load projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    // UI Demo Mode - navigate to editor demo
    navigate(`/editor?demo=true`);
    onClose();
  };

  const handleDeleteProject = async (projectId: string) => {
    // UI Demo Mode - no actual deletion
    toast.info("UI Demo: Project deletion is disabled in demo mode");
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] p-0 !fixed !top-0 !left-1/2 !-translate-x-1/2 !translate-y-0 !mt-10">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                
              </div>
            </div>
          </div>

          {/* Projects Container - Fixed height with scrolling */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-600">Loading projects...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first Flutter component to get started'
                    }
                  </p>
                  
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  : "space-y-3"
              }>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={handleOpenProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};