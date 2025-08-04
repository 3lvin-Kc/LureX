import React from 'react';
import { Button } from '@/components/ui/button';

interface JustInTimeInterventionProps {
  intervention: any;
  onComplete: () => void;
}

export const JustInTimeIntervention: React.FC<JustInTimeInterventionProps> = ({
  intervention,
  onComplete
}) => {
  return (
    <Button onClick={onComplete} variant="destructive">
      Complete {intervention.intervention_type.replace('_', ' ')}
    </Button>
  );
};