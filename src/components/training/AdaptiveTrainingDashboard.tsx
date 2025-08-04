import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Book,
  BarChart3
} from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { TrainingModuleCard } from './TrainingModuleCard';
import { LearningPathVisualization } from './LearningPathVisualization';
import { JustInTimeIntervention } from './JustInTimeIntervention';

export const AdaptiveTrainingDashboard = () => {
  const {
    trainingModules,
    userProgress,
    learningData,
    interventions,
    loading,
    generateLearningPath,
    startTrainingModule,
    completeIntervention,
  } = useAdaptiveLearning();

  const [activeTab, setActiveTab] = useState('overview');

  // Calculate dashboard statistics
  const totalModules = trainingModules.length;
  const completedModules = userProgress.filter(p => p.status === 'completed').length;
  const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const avgScore = userProgress.length > 0 ? 
    userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length : 0;

  const pendingInterventions = interventions.filter(i => i.status === 'pending');
  const highPriorityInterventions = pendingInterventions.filter(i => 
    i.priority_level === 'high' || i.priority_level === 'critical'
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Adaptive Training System</h1>
          <p className="text-muted-foreground">
            Personalized cybersecurity training based on your performance and risk profile
          </p>
        </div>
        <Button onClick={generateLearningPath} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          Update Learning Path
        </Button>
      </div>

      {/* High Priority Interventions Alert */}
      {highPriorityInterventions.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Immediate Training Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have {highPriorityInterventions.length} high-priority training intervention(s) 
              that require immediate attention.
            </p>
            <div className="flex gap-2">
              {highPriorityInterventions.map((intervention) => (
                <JustInTimeIntervention
                  key={intervention.id}
                  intervention={intervention}
                  onComplete={() => completeIntervention(intervention.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{avgScore.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Based on completed assessments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Profile</p>
                <p className="text-2xl font-bold capitalize">
                  {learningData?.risk_profile || 'Medium'}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <Badge 
              variant={learningData?.risk_profile === 'high' ? 'destructive' : 'secondary'}
              className="mt-2"
            >
              {learningData?.risk_profile || 'medium'} risk
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Learning Velocity</p>
                <p className="text-2xl font-bold">
                  {(learningData?.learning_velocity || 1.0).toFixed(1)}x
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Relative to average learner
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Training Modules
          </TabsTrigger>
          <TabsTrigger value="path" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning Path
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Interventions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Knowledge Gaps and Strengths */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Knowledge Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                {learningData?.knowledge_gaps.length ? (
                  <div className="space-y-2">
                    {learningData.knowledge_gaps.map((gap, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No specific knowledge gaps identified. Great work!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strength Areas</CardTitle>
              </CardHeader>
              <CardContent>
                {learningData?.strength_areas.length ? (
                  <div className="space-y-2">
                    {learningData.strength_areas.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Complete more training to identify your strengths.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Training Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProgress.slice(0, 5).map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        progress.status === 'completed' ? 'bg-green-500' :
                        progress.status === 'in_progress' ? 'bg-blue-500' :
                        progress.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{progress.training_modules?.module_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {progress.training_modules?.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{progress.progress_percentage}%</p>
                      {progress.score && (
                        <p className="text-xs text-muted-foreground">Score: {progress.score}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trainingModules.map((module) => {
              const progress = userProgress.find(p => p.module_id === module.id);
              return (
                <TrainingModuleCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  onStart={() => startTrainingModule(module.id)}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="path">
          <LearningPathVisualization
            learningData={learningData}
            trainingModules={trainingModules}
            userProgress={userProgress}
          />
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="grid gap-4">
            {interventions.map((intervention) => (
              <Card key={intervention.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {intervention.trigger_event.replace('_', ' ')} intervention
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {intervention.intervention_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          intervention.priority_level === 'critical' ? 'destructive' :
                          intervention.priority_level === 'high' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {intervention.priority_level}
                      </Badge>
                      <Badge variant="outline">{intervention.status}</Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(intervention.created_at).toLocaleString()}
                  </div>
                  
                  {intervention.status === 'pending' && (
                    <Button 
                      className="mt-4"
                      onClick={() => completeIntervention(intervention.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};