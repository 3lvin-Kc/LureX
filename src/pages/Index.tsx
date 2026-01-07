// Main index page - Integrated with backend Zero-to-One Mode Detection & Hard Boundary Layer

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Smartphone, Zap, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { UserMenu } from "@/components/auth/UserMenu";
import { useProjectState } from "../contexts/ProjectStateContext";
import { toast } from "sonner";

const EXAMPLE_PROMPTS = [
  "A social media app",
  "A personal todo app with beautifull UI",
  "A trading dashboard using shadcn/flutter",
  "A recipe app with search filters and meal planning integration",
];

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProjectGallery, setShowProjectGallery] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    projectState,
    mode,
    isLoading,
    error,
    executeGatekeeping,
    createNewProject,
  } = useProjectState();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Require authentication before creating a project
    if (!user) {
      toast.error("Please sign in to create a project");
      navigate("/auth");
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new project via backend API (requires valid auth token)
      const newProject = await createNewProject();

      // Use 'id' (database row UUID) as the primary identifier
      // project_id may be null during ZERO_TO_ONE phase before project identity is established
      const projectIdentifier = newProject?.id || newProject?.project_id;

      if (!newProject || !projectIdentifier) {
        toast.error("Failed to create new project. Please try again.");
        setIsGenerating(false);
        return;
      }

      // Navigate to editor page with the project identifier and prompt
      navigate(`/editor?project=${projectIdentifier}&prompt=${encodeURIComponent(prompt.trim())}`);
    } catch (e: unknown) {
      console.error("Error during generation:", e);
      setIsGenerating(false);

      const errorMessage = e instanceof Error ? e.message : String(e);

      // Handle authentication errors specifically
      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("401")
      ) {
        toast.error("Please sign in to continue");
        navigate("/auth");
      } else {
        toast.error(
          errorMessage || "Failed to create project. Please try again.",
        );
      }
    }
  };

  // Show error if there's a project state error
  useEffect(() => {
    if (error) {
      toast.error(`Project state error: ${error}`);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">F3-AI </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-mono text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Documentation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjectGallery(true)}
              className="font-mono text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Dashboard
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-mono font-bold mb-6 text-balance text-gray-900 dark:text-white tracking-tight">
            Flutter UI Components
          </h1>

          <p className="text-xl font-mono mb-12 text-balance max-w-2xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400">
            Create reusable Flutter UI components for your existing apps.
            <br />
            Describe your UI component and generate production-ready code.
          </p>

          {/* Main Input */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 bg-white dark:bg-black shadow-sm">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your Flutter UI component idea in detail..."
              className="min-h-32 text-base font-mono resize-none border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-white"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleGenerate();
                }
              }}
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="text-sm font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                    ⌘
                  </kbd>
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 px-1.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                    Enter
                  </kbd>
                  <span>to generate (demo)</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="font-mono text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border border-gray-300 dark:border-gray-600"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Processing Demo...
                  </>
                ) : (
                  <>
                    Try Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          {!isGenerating && (
            <div className="mb-16">
              <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4">
                Try these example prompts (UI demo only):
              </p>
              <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-mono text-gray-700 dark:text-gray-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        {!isGenerating && (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4 bg-white dark:bg-black">
                <Zap className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-mono font-semibold mb-2 text-gray-900 dark:text-white">UI Demonstration</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-mono">
                Explore user interface and design patterns without backend
                functionality.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4 bg-white dark:bg-black">
                <Smartphone className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-mono font-semibold mb-2 text-gray-900 dark:text-white">
                Interactive Components
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-mono">
                Test UI components and user interactions in this demo
                environment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4 bg-white dark:bg-black">
                <Download className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-lg font-mono font-semibold mb-2 text-gray-900 dark:text-white">
                Authentication Only
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-mono">
                Only authentication functionality connects to backend for
                login/signup.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Project Gallery Modal */}
      <ProjectGallery
        isOpen={showProjectGallery}
        onClose={() => setShowProjectGallery(false)}
      />
    </div>
  );
};

export default Index;
