// PotentialScore.tsx
// Shows how many points the user could gain from incomplete quests

import { ChecklistItem } from '@/types';

interface PotentialScoreProps {
  currentScore: number;
  checklist: ChecklistItem[];
}

export function PotentialScore({ currentScore, checklist }: PotentialScoreProps) {
  // Calculate potential points from incomplete quests
  const incompleteQuests = checklist.filter(item => !item.completed);
  const potentialPoints = incompleteQuests.reduce((sum, item) => sum + item.points, 0);
  const potentialScore = Math.min(currentScore + potentialPoints, 1000);

  if (potentialPoints === 0) {
    return null; // All quests completed
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✨</div>
          <div>
            <div className="text-sm font-medium text-gray-300">Potential Score</div>
            <div className="text-xs text-gray-400">
              Complete {incompleteQuests.length} quest{incompleteQuests.length !== 1 ? 's' : ''} to unlock
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
            {potentialScore}
          </div>
          <div className="text-xs text-gray-400">
            +{potentialPoints} pts
          </div>
        </div>
      </div>

      {/* Progress visualization */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Current</span>
          <span>Potential</span>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          {/* Current score */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${(currentScore / 1000) * 100}%` }}
          />
          {/* Potential additional points */}
          <div
            className="absolute inset-y-0 bg-gradient-to-r from-amber-500/50 to-yellow-500/50"
            style={{ 
              left: `${(currentScore / 1000) * 100}%`,
              width: `${(potentialPoints / 1000) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Alternative: Inline potential indicator in score display
export function PotentialScoreInline({ currentScore, potentialPoints }: { currentScore: number; potentialPoints: number }) {
  if (potentialPoints === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 text-sm">
      <span className="text-gray-400">→</span>
      <span className="text-amber-400 font-semibold">
        {Math.min(currentScore + potentialPoints, 1000)}
      </span>
      <span className="text-xs text-gray-500">
        (+{potentialPoints} available)
      </span>
    </div>
  );
}

// Example usage in BaseScoreTab:
/*
import { PotentialScore } from '@/components/PotentialScore';

<div className="space-y-4">
  <ScoreHero score={baseScore} percentile={percentile} />
  <PotentialScore currentScore={baseScore} checklist={checklist} />
  <Checklist items={checklist} />
</div>
*/
