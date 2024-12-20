'use client';

import { motion } from 'framer-motion';

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionGraphProps {
  data: ContributionDay[];
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data }) => {
  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count <= 3) return 'bg-emerald-900/50';
    if (count <= 6) return 'bg-emerald-700/50';
    if (count <= 9) return 'bg-emerald-500/50';
    return 'bg-emerald-300/50';
  };

  const getTooltipText = (day: ContributionDay) => {
    const date = new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const contributions = day.count === 1 ? 'contribution' : 'contributions';
    return `${day.count} ${contributions} on ${date}`;
  };

  // Group contributions by week
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: (weekIndex * 7 + dayIndex) * 0.01,
                  }}
                  className="group relative"
                >
                  <div
                    className={`w-3 h-3 rounded-sm ${getContributionColor(
                      day.count
                    )} transition-colors duration-200 hover:ring-2 hover:ring-white/20`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {getTooltipText(day)}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph; 