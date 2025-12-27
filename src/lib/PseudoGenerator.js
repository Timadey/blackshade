const ADJECTIVES = [
    'Neon', 'Shadow', 'Silent', 'Dancing', 'Ghostly', 'Cosmic', 'Electric', 'Velvet',
    'Midnight', 'Wild', 'Hidden', 'Crystal', 'Golden', 'Silver', 'Mystic', 'Rapid',
    'Quiet', 'Brave', 'Cunning', 'Swift', 'Lone', 'Lunar', 'Solar', 'Icy'
];

const NOUNS = [
    'Raven', 'Fox', 'Wolf', 'Panther', 'Eagle', 'Hawk', 'Tiger', 'Lion',
    'Dragon', 'Phoenix', 'Cobra', 'Falcon', 'Owl', 'Lynx', 'Stag', 'Coyote',
    'Viper', 'Bear', 'Shark', 'Orca', 'Griffin', 'Badger', 'Rabbit', 'Deer'
];

export const generatePseudonym = (seed) => {
    // If a seed is provided (e.g., user ID or IP part), use it for consistent naming
    // Otherwise, use math.random
    let hash = 0;
    if (seed) {
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
    } else {
        hash = Math.floor(Math.random() * 1000000);
    }

    const adjIndex = Math.abs(hash) % ADJECTIVES.length;
    const nounIndex = (Math.abs(hash) >> 4) % NOUNS.length; // Shift a bit to get different entropy

    return `${ADJECTIVES[adjIndex]} ${NOUNS[nounIndex]}`;
};

export const getRandomBackground = (seed) => {
    const gradients = [
        'bg-gradient-to-br from-purple-500 to-pink-500',
        'bg-gradient-to-br from-blue-500 to-cyan-500',
        'bg-gradient-to-br from-green-400 to-blue-500',
        'bg-gradient-to-br from-yellow-400 to-orange-500',
        'bg-gradient-to-br from-indigo-500 to-purple-600',
        'bg-gradient-to-br from-rose-500 to-orange-400',
    ];

    let hash = 0;
    if (seed) {
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
    } else {
        hash = Math.floor(Math.random() * gradients.length);
    }

    return gradients[Math.abs(hash) % gradients.length];
};

export const RANDOM_PROMPTS = [
    "send me an anonymous message!",
    "how tall r u?",
    "what's your biggest regret?",
    "do u believe in second chances?",
    "if u could be any animal, what would u be?",
    "what's your hidden talent?",
    "who is your crush?",
    "favorite memory from childhood?",
    "apple or android?",
    "what's the best advice u ever got?",
    "most embarrassing moment?",
    "if u won a million dollars, what's the first thing u would buy?",
    "what's your favorite song right now?",
    "coffee or tea?",
    "describe yourself in 3 words"
];

export const getRandomPrompt = () => {
    return RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
};
