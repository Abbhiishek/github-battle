'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComparisonRoast } from '@/lib/openai';
import type { GitHubUserData } from '@/lib/github';

interface UserComparisonProps {
    user1: GitHubUserData;
    user2: GitHubUserData;
    roasts: ComparisonRoast[];
}

export function UserComparison({ user1, user2, roasts }: UserComparisonProps) {
    const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
    const currentRoast = roasts[currentRoastIndex];

    const handleNextRoast = () => {
        setCurrentRoastIndex((prev) => (prev + 1) % roasts.length);
    };

    const handlePrevRoast = () => {
        setCurrentRoastIndex((prev) => (prev - 1 + roasts.length) % roasts.length);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User 1 Stats */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 shadow-xl">
                    <img
                        src={user1.avatarUrl}
                        alt={user1.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white"
                    />
                    <h3 className="text-2xl font-bold text-white text-center mb-4">{user1.name}</h3>
                    <div className="space-y-2 text-white">
                        <p>Power Level: {user1.powerLevel}</p>
                        <p>Stars: {user1.totalStars.toLocaleString()}</p>
                        <p>Commits: {user1.totalCommits.toLocaleString()}</p>
                        <p>Contributions: {user1.contributions.toLocaleString()}</p>
                    </div>
                </div>

                {/* User 2 Stats */}
                <div className="bg-gradient-to-br from-pink-600 to-orange-600 rounded-xl p-6 shadow-xl">
                    <img
                        src={user2.avatarUrl}
                        alt={user2.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white"
                    />
                    <h3 className="text-2xl font-bold text-white text-center mb-4">{user2.name}</h3>
                    <div className="space-y-2 text-white">
                        <p>Power Level: {user2.powerLevel}</p>
                        <p>Stars: {user2.totalStars.toLocaleString()}</p>
                        <p>Commits: {user2.totalCommits.toLocaleString()}</p>
                        <p>Contributions: {user2.contributions.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Roast Card */}
            <div className="relative">
                <motion.div
                    className="relative w-full cursor-pointer"
                    onClick={handleNextRoast}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentRoastIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 shadow-xl"
                        >
                            <div className="bg-black/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrevRoast();
                                        }}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-white/80 text-sm">
                                        {currentRoastIndex + 1} of {roasts.length}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNextRoast();
                                        }}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                                <h4 className="text-xl font-semibold text-white mb-2">
                                    {currentRoast.aspect}
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-300 font-semibold">
                                            Winner:
                                        </span>
                                        <span className="text-white">
                                            {currentRoast.winner}
                                        </span>
                                    </div>
                                    <p className="text-white text-lg leading-relaxed">
                                        {currentRoast.roast}
                                    </p>
                                </div>
                                <div className="mt-4 text-center text-white/60 text-sm">
                                    Click anywhere for next roast
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-1 mt-4">
                    {roasts.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentRoastIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentRoastIndex
                                    ? 'bg-white scale-125'
                                    : 'bg-white/30 hover:bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 