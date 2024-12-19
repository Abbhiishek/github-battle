import { NextResponse } from 'next/server';
import type { ComparisonRoast } from '@/lib/openai';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

export async function POST(request: Request) {
    try {
        const { user1, user2 } = await request.json();

        const prompt = `You're a witty tech comedian roasting GitHub developers. Create hilarious, spicy (but not offensive) comparisons between these two developers. Think of it as a friendly rap battle between coders.

User 1: ${user1.name} (@${user1.login})
Stats:
- Power Level: ${user1.stats.powerLevel}
- Total Stars: ${user1.stats.totalStars}
- Total Commits: ${user1.stats.totalCommits}
- Contributions: ${user1.stats.contributions}
- Public Repos: ${user1.stats.publicRepos}
- Followers: ${user1.stats.followers}
- Longest Streak: ${user1.stats.longestStreak} days
- Top Languages: ${user1.stats.topLanguages.map((l: { name: string }) => l.name).join(', ')}

User 2: ${user2.name} (@${user2.login})
Stats:
- Power Level: ${user2.stats.powerLevel}
- Total Stars: ${user2.stats.totalStars}
- Total Commits: ${user2.stats.totalCommits}
- Contributions: ${user2.stats.contributions}
- Public Repos: ${user2.stats.publicRepos}
- Followers: ${user2.stats.followers}
- Longest Streak: ${user2.stats.longestStreak} days
- Top Languages: ${user2.stats.topLanguages.map((l: { name: string }) => l.name).join(', ')}

Generate 10 spicy, entertaining roasts comparing their GitHub activity. Make them funny and engaging, like a mix of a comedy roast and tech humor. Reference popular culture, coding stereotypes, and developer inside jokes. Think "JavaScript Roast Battle" meets "Silicon Valley" humor.

Compare different aspects like:
- Coding consistency and commit patterns
- Language preferences and tech stack choices
- Project popularity and star counts
- Community engagement and followers
- Code productivity and contribution streaks
- Repository management style
- Overall GitHub presence and impact
- Development habits and patterns
- Tech ecosystem preferences
- Coding style and approach

For each roast, follow this format EXACTLY:

Aspect: [what's being compared]
Winner: [winner's name]
Roast: [your spicy roast]

Example formats:

Example 1:
Aspect: Commit Frequency
Winner: Sarah
Roast: While Sarah's pushing code faster than npm installs dependencies, Bob's commits are like Windows updates - they show up once a month and usually break something! 😅

Example 2:
Aspect: Repository Count
Winner: Alex
Roast: Alex is hoarding repos like developers hoard Stack Overflow tabs! Meanwhile, Chris's GitHub is looking more abandoned than a jQuery tutorial in 2024! 🏚️

Example 3:
Aspect: Code Languages
Winner: Maria
Roast: Maria's out here mastering 5 languages while Pat's still trying to center a div in CSS! That's like bringing a full tech stack to a "Hello World" fight! 💪

Keep the roasts spicy and fun, focusing on their coding stats and dev culture references. Make each roast memorable and quotable, but avoid anything mean-spirited or personal. Think "friendly dev rivalry" vibes!`;

        const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_OPENAI_KEY!,
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a hilarious developer comedian who specializes in tech humor and coding roasts. Your style is witty, current, and packed with developer culture references. You know how to make spicy but good-natured jokes about coding habits and GitHub statistics.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.9,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate roasts');
        }

        const data = await response.json();
        const roastText = data.choices[0].message.content;

        // Parse the roasts from the AI response
        const roasts: ComparisonRoast[] = roastText
            .split(/\n\s*\n/) // Split by empty lines
            .filter((block: string) => block.trim()) // Remove empty blocks
            .map((block: string) => {
                try {
                    const lines = block.split('\n').map((line: string) => line.trim());
                    const aspectLine = lines.find((line: string) => line.startsWith('Aspect:'));
                    const winnerLine = lines.find((line: string) => line.startsWith('Winner:'));
                    const roastLine = lines.find((line: string) => line.startsWith('Roast:'));

                    if (!aspectLine || !winnerLine || !roastLine) {
                        console.warn('Invalid roast format:', block);
                        return null;
                    }

                    const aspect = aspectLine.replace('Aspect:', '').trim();
                    const winner = winnerLine.replace('Winner:', '').trim();
                    const roast = roastLine.replace('Roast:', '').trim();

                    const loser = winner.includes(user1.name) ? user2.name : user1.name;

                    return {
                        aspect,
                        winner,
                        loser,
                        roast,
                    };
                } catch (error) {
                    console.warn('Error parsing roast block:', error);
                    return null;
                }
            })
            .filter((r: unknown): r is ComparisonRoast => r !== null);

        if (roasts.length === 0) {
            throw new Error('Failed to generate valid roasts');
        }

        return NextResponse.json(roasts);
    } catch (error) {
        console.error('Error in comparison route:', error);
        return NextResponse.json(
            { error: 'Failed to generate comparison' },
            { status: 500 }
        );
    }
} 