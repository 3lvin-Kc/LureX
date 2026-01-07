
import { useState, useEffect } from 'react';
import { 
  Package, 
  Smartphone, 
  Cog, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Folder,
  Code,
  Cpu,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BuildStep {
  id: string;
  text: string;
  icon: React.ReactNode;
  completed: boolean;
  progress: number;
  duration: number;
  details: string[];
  substeps: string[];
}

const BUILD_STEPS: Omit<BuildStep, 'completed' | 'progress'>[] = [
  {
    id: "init",
    text: "Initializing Flutter Environment",
    icon: <Package className="w-5 h-5" />,
    duration: 2000,
    details: [
      "Setting up project structure",
      "Configuring build environment",
      "Initializing version control"
    ],
    substeps: [
      "Creating project directory",
      "Setting up pubspec.yaml",
      "Initializing git repository",
      "Configuring IDE settings"
    ]
  },
  {
    id: "analysis",
    text: "Analyzing Requirements",
    icon: <Cpu className="w-5 h-5" />,
    duration: 1800,
    details: [
      "Parsing user requirements",
      "Identifying key features",
      "Planning architecture"
    ],
    substeps: [
      "Natural language processing",
      "Feature extraction",
      "Architecture planning",
      "Dependencies mapping"
    ]
  },
  {
    id: "dependencies",
    text: "Resolving Dependencies",
    icon: <Cog className="w-5 h-5" />,
    duration: 2500,
    details: [
      "Installing core packages",
      "Resolving version conflicts",
      "Optimizing package tree"
    ],
    substeps: [
      "Fetching package metadata",
      "Resolving version constraints",
      "Downloading packages",
      "Building dependency graph"
    ]
  },
  {
    id: "generation",
    text: "Generating Code Structure",
    icon: <Code className="w-5 h-5" />,
    duration: 3000,
    details: [
      "Creating widget hierarchy",
      "Generating business logic",
      "Setting up routing"
    ],
    substeps: [
      "Generating main.dart",
      "Creating screen widgets",
      "Setting up models",
      "Implementing services"
    ]
  },
  {
    id: "ui",
    text: "Building User Interface",
    icon: <Smartphone className="w-5 h-5" />,
    duration: 2200,
    details: [
      "Designing responsive layouts",
      "Implementing Material Design",
      "Adding animations"
    ],
    substeps: [
      "Creating layout structure",
      "Implementing themes",
      "Adding animations",
      "Optimizing for different screens"
    ]
  },
  {
    id: "optimization",
    text: "Optimizing Performance",
    icon: <Zap className="w-5 h-5" />,
    duration: 1500,
    details: [
      "Tree shaking unused code",
      "Optimizing asset loading",
      "Implementing lazy loading"
    ],
    substeps: [
      "Code splitting",
      "Asset optimization",
      "Bundle size analysis",
      "Performance profiling"
    ]
  },
  {
    id: "build",
    text: "Finalizing Build",
    icon: <FileCode className="w-5 h-5" />,
    duration: 1800,
    details: [
      "Compiling Dart code",
      "Generating build artifacts",
      "Running final checks"
    ],
    substeps: [
      "Dart compilation",
      "Asset bundling",
      "Code signing",
      "Final validation"
    ]
  }
];

interface BuildProcessVisualizationProps {
  isActive: boolean;
  onStepComplete?: (stepId: string) => void;
  onComplete?: () => void;
}

export const BuildProcessVisualization = ({ 
  isActive, 
  onStepComplete, 
  onComplete 
}: BuildProcessVisualizationProps) => {
  const [steps, setSteps] = useState<BuildStep[]>(
    BUILD_STEPS.map(step => ({ ...step, completed: false, progress: 0 }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSubstep, setCurrentSubstep] = useState(0);
  const [logs, setLogs] = useState<Array<{text: string, type: 'info' | 'success' | 'warning' | 'error', timestamp: string}>>([]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev.slice(-20), { text, type, timestamp }]);
  };

  useEffect(() => {
    if (!isActive) return;

    addLog('Build process initiated', 'info');
    const prompt = localStorage.getItem('appPrompt') || 'Flutter application';
    addLog(`Target: ${prompt}`, 'info');

    const processSteps = async () => {
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        const step = steps[stepIndex];
        setCurrentStepIndex(stepIndex);
        setCurrentSubstep(0);
        
        addLog(`Starting: ${step.text}`, 'info');

        // Process substeps
        for (let substepIndex = 0; substepIndex < step.substeps.length; substepIndex++) {
          setCurrentSubstep(substepIndex);
          
          const substepDuration = step.duration / step.substeps.length;
          const progressIncrement = 100 / step.substeps.length;
          
          // Simulate substep progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, substepDuration / 10));
            
            setSteps(prevSteps => 
              prevSteps.map((s, index) => 
                index === stepIndex 
                  ? { ...s, progress: (substepIndex * progressIncrement) + (progress * progressIncrement / 100) }
                  : s
              )
            );
          }
          
          addLog(`✓ ${step.substeps[substepIndex]}`, 'success');
        }

        // Complete the step
        setSteps(prevSteps => 
          prevSteps.map((s, index) => 
            index === stepIndex ? { ...s, completed: true, progress: 100 } : s
          )
        );
        
        addLog(`Completed: ${step.text}`, 'success');
        onStepComplete?.(step.id);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      addLog('Build process completed successfully', 'success');
      addLog('Ready to launch editor', 'info');
      
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    };

    processSteps();
  }, [isActive, onStepComplete, onComplete]);

  if (!isActive) return null;

  return (
    <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
      {/* Build Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Cog className="w-5 h-5 text-primary" />
          Build Pipeline
        </h3>
        
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg p-4 transition-all duration-300 ${
              step.completed
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                : index === currentStepIndex
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 shadow-md'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex-shrink-0 ${
                step.completed 
                  ? 'text-green-600 dark:text-green-400' 
                  : index === currentStepIndex 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-muted-foreground'
              }`}>
                {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.completed 
                      ? 'text-green-700 dark:text-green-300'
                      : index === currentStepIndex 
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-muted-foreground'
                  }`}>
                    {step.text}
                  </h4>
                  
                  {index === currentStepIndex && !step.completed && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {index === currentStepIndex && !step.completed && (
                  <div className="mt-2 space-y-2">
                    <Progress value={step.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {step.substeps[currentSubstep] || step.details[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {step.completed && (
              <div className="ml-8 space-y-1">
                {step.details.map((detail, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    ✓ {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Build Logs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary" />
          Build Console
        </h3>
        
        <div className="bg-slate-900 rounded-lg border border-slate-700 h-96 overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-gray-400 ml-2">build_console</span>
            </div>
          </div>
          
          <div className="p-4 h-full overflow-y-auto font-mono text-sm space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {log.timestamp}
                </span>
                <span className={`${
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-gray-300'
                } leading-relaxed`}>
                  {log.text}
                </span>
              </div>
            ))}
            
            <div className="flex items-center gap-2 text-gray-400 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs">Building...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
