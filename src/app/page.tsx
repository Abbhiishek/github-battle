'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Github } from 'lucide-react';
import { fetchGitHubUserData, GitHubUserData } from '@/lib/github';
import { ComparisonRoast, generateComparison } from '@/lib/openai';
import { UserComparison } from '@/components/user-comparison';
import { useRouter } from 'next/navigation';

export default function Home() {
  let [username1, setUsername1] = useState('');
  let[username2, setUsername2] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    user1: GitHubUserData;
    user2: GitHubUserData;
    roasts: ComparisonRoast[];
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const u1 = urlParams.get('u1');
    const u2 = urlParams.get('u2');
  
    // console.log('u1:', u1, 'u2:', u2);  
    //commenting logs for push
  
    if (u1 && u2) {
      setUsername1(u1);
      setUsername2(u2);
      username1 = u1;
      username2 = u2;
      handleCompare(); // Automatically start comparison if we have a valid u1 and u2 .. let's see
    }
  }, []);
  
  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("user1", username1, "user2", username2);
    //commenting the console for push
    if (!username1 || !username2) {
      setError('Please enter both usernames');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user1Data = await fetchGitHubUserData(username1);
      const user2Data = await fetchGitHubUserData(username2);
      const roasts = await generateComparison(user1Data, user2Data);

      setComparisonData({
        user1: user1Data,
        user2: user2Data,
        roasts,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparison');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="relative">
              <Github className="w-12 h-12 text-purple-400" />
              <motion.div
                initial={{ rotate: -45, x: 10 }}
                animate={{ rotate: 0, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -bottom-2 -right-2"
              >
                <Swords className="w-8 h-8 text-pink-400" />
              </motion.div>
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            GitHub Battle
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Compare GitHub profiles and get hilarious AI-generated roasts!
          </p>

          <form onSubmit={handleCompare} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={username1}
                onChange={(e) => setUsername1(e.target.value)}
                placeholder="First GitHub username"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
              />
              <span className="hidden md:inline text-2xl font-bold text-purple-400">
                VS
              </span>
              <input
                type="text"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
                placeholder="Second GitHub username"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 font-semibold transform transition-all ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 hover:shadow-lg'
                }`}
            >
              {isLoading ? 'Loading...' : 'Compare Profiles'}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-400 bg-red-400/10 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserComparison
              user1={comparisonData.user1}
              user2={comparisonData.user2}
              roasts={comparisonData.roasts}
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}
