// ShareButton.tsx
// Social sharing component for viral growth

import { getRankInfo } from '@/utils/getRankInfo';

interface ShareButtonProps {
  score: number;
  address?: string;
}

export function ShareButton({ score, address }: ShareButtonProps) {
  const rankInfo = getRankInfo(score);
  
  const handleShare = () => {
    // Pre-written tweet template
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://base-score-neon.vercel.app';
    const tweetText = `I scored ${score}/1000 on Base and earned the '${rankInfo.label}' rank! ${rankInfo.emoji}

Are you a Newcomer or a Governor?

Check your Base Score: ${baseUrl}`;

    // Open Twitter share dialog
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span>Share on 𝕏</span>
    </button>
  );
}

// Alternative: Compact share button for mobile
export function ShareButtonCompact({ score }: ShareButtonProps) {
  const rankInfo = getRankInfo(score);
  
  const handleShare = () => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://base-score-neon.vercel.app';
    const tweetText = `I scored ${score}/1000 on Base and earned the '${rankInfo.label}' rank! ${rankInfo.emoji}

Are you a Newcomer or a Governor?

Check your Base Score: ${baseUrl}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span>Share</span>
    </button>
  );
}

// Example usage in ScoreHero or Dashboard:
/*
import { ShareButton } from '@/components/ShareButton';

<div className="mt-6 flex justify-center">
  <ShareButton score={baseScore} address={address} />
</div>
*/
