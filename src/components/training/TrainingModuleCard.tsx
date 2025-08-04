import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrainingModuleCardProps {
  module: any;
  progress?: any;
  onStart: () => void;
}

export const TrainingModuleCard: React.FC<TrainingModuleCardProps> = ({
  module,
  progress,
  onStart
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{module.module_name}</CardTitle>
        <Badge variant="outline">{module.category}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {module.estimated_duration} minutes • {module.difficulty_level}
        </p>
        <Button onClick={onStart} className="w-full">
          {progress?.status === 'completed' ? 'Review' : 'Start Training'}
        </Button>
      </CardContent>
    </Card>
  );
};