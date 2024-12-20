import type { GitHubUserData } from './github';

export interface ComparisonRoast {
  winner: string;
  loser: string;
  aspect: string;
  roast: string;
}

export async function generateComparison(user1: GitHubUserData, user2: GitHubUserData): Promise<ComparisonRoast[]> {
  try {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user1: {
          name: user1.name,
          login: user1.login,
          stats: {
            powerLevel: user1.powerLevel,
            totalStars: user1.totalStars,
            totalCommits: user1.totalCommits,
            contributions: user1.contributions,
            publicRepos: user1.publicRepos,
            followers: user1.followers,
            longestStreak: user1.longestStreak,
            topLanguages: user1.topLanguages,
          },
        },
        user2: {
          name: user2.name,
          login: user2.login,
          stats: {
            powerLevel: user2.powerLevel,
            totalStars: user2.totalStars,
            totalCommits: user2.totalCommits,
            contributions: user2.contributions,
            publicRepos: user2.publicRepos,
            followers: user2.followers,
            longestStreak: user2.longestStreak,
            topLanguages: user2.topLanguages,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate comparison');
    }

    const roasts = await response.json();
    
    if (!Array.isArray(roasts) || roasts.length === 0) {
      throw new Error('Invalid response format from comparison API');
    }

    return roasts;
  } catch (error) {
    console.error('Error generating comparison:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate comparison');
  }
} 