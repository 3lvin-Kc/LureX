import { Loader2 } from 'lucide-react';

export const AiLoadingIndicator = () => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      <span className="animate-pulse">AI is thinking...</span>
    </div>
  );
};
