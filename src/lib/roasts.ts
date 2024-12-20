interface RoastData {
  topLanguages: Array<{ name: string; percentage: number }>;
  contributions: number;
  longestStreak: number;
  publicRepos: number;
  followers: number;
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRoasts(data: RoastData): string[] {
  const roasts: string[] = [];

  // Language-based roasts
  const topLanguage = data.topLanguages[0];
  if (topLanguage) {
    const languageRoasts = {
      JavaScript: [
        "Ah, JavaScript - because who needs type safety when you have 'undefined is not a function'? 😅",
        "I see you're a JavaScript enthusiast. How many npm packages does it take to print 'Hello World'? 🤔",
      ],
      TypeScript: [
        "A TypeScript developer! Someone who enjoys writing more types than actual code. 🎯",
        "Using TypeScript because you trust no one, not even yourself. Smart choice! 🛡️",
      ],
      Python: [
        "Spaces or tabs? Just kidding, I know you're team Python - where indentation is life! 🐍",
        "Writing Python? That's just executable pseudocode with extra steps! 🚀",
      ],
      Java: [
        "AbstractSingletonProxyFactoryBean... I mean, Java! You must really love typing! ☕",
        "Java developer spotted! How's that enterprise-grade hello world coming along? 🏢",
      ],
      "C++": [
        "C++ developer? You must be a masochist who enjoys debugging memory leaks! 💭",
        "Ah, C++, because why make things simple when you can make them complex? 🎮",
      ],
      Ruby: [
        "A Ruby developer! Because why write 10 lines when you can write it in 2? 💎",
        "Ruby: Where everything is an object, even your problems! 🎪",
      ],
      PHP: [
        "PHP developer spotted! Because someone has to maintain WordPress! 🎭",
        "Using PHP? Your commitment to legacy systems is admirable! 🏺",
      ],
      Go: [
        "Go developer! Because error handling is better than exception handling, right? 🏃",
        "Writing Go? That's a very concurrent decision of you! 🔄",
      ],
      Rust: [
        "Ah, Rust! Fighting with the borrow checker must keep you up at night! 🦀",
        "A Rust developer! How many times did you rewrite everything in Rust? 🔒",
      ],
    };

    const genericLanguageRoasts = [
      `${topLanguage.percentage.toFixed(1)}% ${topLanguage.name}? You really put all your eggs in one basket! 🥚`,
      `Wow, ${topLanguage.name} is your top language. Bold choice! 🎨`,
    ];

    roasts.push(
      languageRoasts[topLanguage.name as keyof typeof languageRoasts]?.[0] ||
        getRandomItem(genericLanguageRoasts)
    );
  }

  // Contribution-based messages
  if (data.contributions > 1000) {
    roasts.push("Your keyboard must be begging for mercy with all those contributions! 🔥");
  } else if (data.contributions > 500) {
    roasts.push("Decent contribution count! The GitHub activity graph must look like a city skyline! 🌆");
  } else {
    roasts.push("Your contribution graph is like a minimalist art piece - beautifully sparse! 🎨");
  }

  // Streak-based messages
  if (data.longestStreak > 20) {
    roasts.push("That streak! Do you ever see the sun, or is your monitor your only light source? ☀️");
  } else if (data.longestStreak > 10) {
    roasts.push("Nice streak! Almost as long as a Netflix binge-watching session! 📺");
  } else {
    roasts.push("Your commit streak is like my gym routine - consistently inconsistent! 💪");
  }

  // Repository-based messages
  if (data.publicRepos > 50) {
    roasts.push("Your GitHub account has more repos than I have excuses for not documenting my code! 📚");
  } else if (data.publicRepos > 20) {
    roasts.push("Nice repo collection! Marie Kondo would be proud of your project hoarding! ✨");
  } else {
    roasts.push("Your repo count is like a capsule wardrobe - minimal but meaningful! 👔");
  }

  // Follower-based messages
  if (data.followers > 1000) {
    roasts.push("Look at you, GitHub influencer! When's your TED talk on 'How to Center a Div'? 🎤");
  } else if (data.followers > 100) {
    roasts.push("Triple-digit followers! You're like a micro-influencer in the coding world! 📱");
  } else {
    roasts.push("Your follower count is exclusive - like a private npm package! 📦");
  }

  return roasts;
} 