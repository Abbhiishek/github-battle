import { Octokit } from '@octokit/rest';

// Initialize Octokit with a personal access token
const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

export interface ContributionDay {
    date: string;
    count: number;
}

export interface MonthlyActivity {
    month: string;
    contributions: number;
}

export interface GitHubUserData {
    name: string;
    login: string;
    avatarUrl: string;
    bio: string;
    followers: number;
    following: number;
    publicRepos: number;
    topLanguages: Array<{ name: string; percentage: number }>;
    contributions: number;
    longestStreak: number;
    contributionCalendar: ContributionDay[];
    powerLevel: number; // 0-100 based on various metrics
    totalStars: number;
    totalCommits: number;
    mostActiveMonths: MonthlyActivity[];
    universalRank: {
        rank: number;
        percentile: number;
    };
}

async function fetchContributionData(username: string): Promise<{
    contributionDays: ContributionDay[];
    totalContributions: number;
    monthlyContributions: MonthlyActivity[];
}> {
    const query = `
        query($username: String!) {
            user(login: $username) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { username },
        }),
    });

    const data = await response.json();

    if (data.errors) {
        throw new Error(data.errors[0].message);
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar;
    const contributionDays: ContributionDay[] = [];
    const monthlyMap = new Map<string, number>();

    calendar.weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
            const date = new Date(day.date);
            const monthKey = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

            monthlyMap.set(
                monthKey,
                (monthlyMap.get(monthKey) || 0) + day.contributionCount
            );

            contributionDays.push({
                date: day.date,
                count: day.contributionCount,
            });
        });
    });

    // Convert monthly map to sorted array
    const monthlyContributions = Array.from(monthlyMap.entries())
        .map(([month, contributions]) => ({
            month,
            contributions,
        }))
        .sort((a, b) => b.contributions - a.contributions);

    return {
        contributionDays,
        totalContributions: calendar.totalContributions,
        monthlyContributions,
    };
}

async function calculateTotalStars(username: string): Promise<number> {
    let totalStars = 0;
    let page = 1;
    const perPage = 100;

    while (true) {
        const { data: repos } = await octokit.repos.listForUser({
            username,
            per_page: perPage,
            page,
        });

        if (repos.length === 0) break;

        totalStars += repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        if (repos.length < perPage) break;
        page++;
    }

    return totalStars;
}

async function calculateTotalCommits(username: string): Promise<number> {
    const { data: repos } = await octokit.repos.listForUser({
        username,
        per_page: 100,
        type: 'owner', // Only get repos owned by the user
    });

    const commitPromises = repos.map(async (repo) => {
        try {
            // Use participation stats which gives total commits
            const { data: participation } = await octokit.repos.getParticipationStats({
                owner: username,
                repo: repo.name,
            });

            if (!participation || !participation.owner) {
                // Fallback to getting commit count through commits endpoint
                const { data: commits } = await octokit.repos.listCommits({
                    owner: username,
                    repo: repo.name,
                    author: username,
                    per_page: 1,
                });

                // Get the total count from response headers
                const match = commits?.response?.headers?.link?.match(/page=(\d+)>; rel="last"/);
                return match ? parseInt(match[1], 10) : commits?.length || 0;
            }

            // Sum up owner's commits from participation stats
            return participation.owner.reduce((sum, count) => sum + count, 0);
        } catch (error) {
            console.warn(`Failed to fetch commits for ${repo.name}:`, error);
            return 0;
        }
    });

    const commitCounts = await Promise.all(commitPromises);
    return commitCounts.reduce((a, b) => a + b, 0);
}

function calculatePowerLevel(data: {
    contributions: number;
    followers: number;
    publicRepos: number;
    totalStars: number;
    totalCommits: number;
}): number {
    const weights = {
        contributions: 0.25,
        followers: 0.2,
        repos: 0.15,
        stars: 0.2,
        commits: 0.2,
    };

    // Normalize each metric to a 0-100 scale with more realistic thresholds
    const normalizedContributions = Math.min(data.contributions / 1000 * 100, 100);
    const normalizedFollowers = Math.min(data.followers / 500 * 100, 100);
    const normalizedRepos = Math.min(data.publicRepos / 50 * 100, 100);
    const normalizedStars = Math.min(data.totalStars / 500 * 100, 100);
    const normalizedCommits = Math.min(data.totalCommits / 2000 * 100, 100);

    return Math.round(
        normalizedContributions * weights.contributions +
        normalizedFollowers * weights.followers +
        normalizedRepos * weights.repos +
        normalizedStars * weights.stars +
        normalizedCommits * weights.commits
    );
}

function calculateUniversalRank(powerLevel: number): { rank: number; percentile: number } {
    // This is a simplified ranking system
    // In a real app, you'd compare against actual GitHub user statistics
    const ranks = [
        { threshold: 90, rank: 'S+' },
        { threshold: 80, rank: 'S' },
        { threshold: 70, rank: 'A+' },
        { threshold: 60, rank: 'A' },
        { threshold: 50, rank: 'B+' },
        { threshold: 40, rank: 'B' },
        { threshold: 30, rank: 'C+' },
        { threshold: 20, rank: 'C' },
        { threshold: 10, rank: 'D' },
        { threshold: 0, rank: 'E' },
    ];

    const rank = ranks.findIndex(r => powerLevel >= r.threshold) + 1;
    const percentile = Math.round((powerLevel / 100) * 100);

    return { rank, percentile };
}

export async function fetchGitHubUserData(username: string): Promise<GitHubUserData> {
    try {
        // Fetch basic user information
        const { data: user } = await octokit.users.getByUsername({
            username,
        });

        // Fetch user's repositories
        const { data: repos } = await octokit.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 100,
        });

        // Calculate top languages
        const languageMap = new Map<string, number>();
        const languagePromises = repos.map(async (repo) => {
            try {
                const { data } = await octokit.repos.listLanguages({
                    owner: username,
                    repo: repo.name,
                });
                return { data };
            } catch (error) {
                console.warn(`Failed to fetch languages for ${repo.name}:`, error);
                return { data: {} };
            }
        });

        const languageResults = await Promise.all(languagePromises);
        languageResults.forEach(({ data }) => {
            Object.entries(data).forEach(([language, bytes]) => {
                languageMap.set(language, (languageMap.get(language) || 0) + bytes);
            });
        });

        const totalBytes = Array.from(languageMap.values()).reduce((a, b) => a + b, 0);
        const topLanguages = Array.from(languageMap.entries())
            .map(([name, bytes]) => ({
                name,
                percentage: (bytes / totalBytes) * 100,
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);

        // Fetch contribution data
        const { contributionDays, totalContributions, monthlyContributions } =
            await fetchContributionData(username);

        // Calculate additional metrics
        const totalStars = await calculateTotalStars(username);
        const totalCommits = await calculateTotalCommits(username);

        // Calculate longest streak
        let currentStreak = 0;
        let longestStreak = 0;
        contributionDays.forEach((day) => {
            if (day.count > 0) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        // Calculate power level and rank
        const powerLevel = calculatePowerLevel({
            contributions: totalContributions,
            followers: user.followers,
            publicRepos: user.public_repos,
            totalStars,
            totalCommits,
        });

        const universalRank = calculateUniversalRank(powerLevel);

        return {
            name: user.name || user.login,
            login: user.login,
            avatarUrl: user.avatar_url,
            bio: user.bio || '',
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            topLanguages,
            contributions: totalContributions,
            longestStreak,
            contributionCalendar: contributionDays,
            powerLevel,
            totalStars,
            totalCommits,
            mostActiveMonths: monthlyContributions.slice(0, 3),
            universalRank,
        };
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        throw new Error('Failed to fetch GitHub data');
    }
} 