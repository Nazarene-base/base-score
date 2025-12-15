// Checklist Item - Individual task in the airdrop checklist
'use client';

import { CheckIcon, XIcon, ExternalLinkIcon } from './Icons';
import type { ChecklistItem as ChecklistItemType } from '@/types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  index: number;
}

export function ChecklistItem({ item, index }: ChecklistItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3.5 bg-bg-card rounded-xl border transition-colors animate-slide-in"
      style={{
        animationDelay: `${index * 0.05}s`,
        borderColor: item.completed ? 'rgba(0, 211, 149, 0.3)' : 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${
            item.completed
              ? 'bg-success text-white'
              : 'bg-bg-tertiary text-gray-500'
          }`}
        >
          {item.completed ? <CheckIcon /> : <XIcon />}
        </div>
        
        {/* Task name */}
        <div>
          <span
            className={`text-sm ${
              item.completed ? 'text-white' : 'text-gray-400'
            }`}
          >
            {item.task}
          </span>
          {item.points && (
            <span className="ml-2 text-xs text-gray-500">
              +{item.points} pts
            </span>
          )}
        </div>
      </div>

      {/* Action button */}
      {!item.completed && item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-base-blue rounded-lg text-white text-xs font-medium hover:bg-base-blue-light transition-colors"
        >
          Do it
          <ExternalLinkIcon />
        </a>
      )}
    </div>
  );
}
