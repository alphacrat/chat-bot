import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Common anime-related keywords and character names
const animeKeywords = [
    'anime', 'manga', 'otaku', 'japanese animation', 'light novel',
    'shounen', 'shoujo', 'seinen', 'josei', 'cosplay', 'naruto', 'luffy', 'goku', 'eren',
    'demon slayer', 'one piece', 'dragon ball', 'attack on titan',
    'hunter x hunter', 'my hero academia', 'bleach', 'death note',
    'studio ghibli', 'miyazaki', 'crunchyroll', 'funimation',
    'senpai', 'kouhai', 'chan', 'kun', 'san',
    'kawaii', 'chibi', 'konnichiwa', 'ohayo', 'sayonara'
];

// Greeting keywords
const greetingKeywords = [
    'hello', 'hi', 'hey', 'konnichiwa', 'ohayo',
    'greetings', 'good morning', 'good afternoon',
    'good evening', 'yo', 'sup', 'hajimemashite'
];

const isGreeting = (message) => {
    const lowerMessage = message.toLowerCase();
    return greetingKeywords.some(keyword => lowerMessage.includes(keyword));
};

const containsAnimeKeywords = (message) => {
    const lowerMessage = message.toLowerCase();
    return animeKeywords.some(keyword => lowerMessage.includes(keyword));
};

const isAnimeRelated = async (message) => {
    // Always allow greetings
    if (isGreeting(message)) {
        return true;
    }

    // Quick check for common anime keywords
    if (containsAnimeKeywords(message)) {
        return true;
    }

    try {
        const validationResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a validator that determines if a message is related to anime, manga, or Japanese animation culture.
                    Consider character names, series titles, anime terminology, and cultural references.
                    Respond with "true" if the message is related to:
                    - Anime or manga series
                    - Anime/manga characters
                    - Japanese animation studios
                    - Anime culture and terminology
                    - Voice actors (seiyuu)
                    - Anime music (openings, endings, OSTs)
                    - Anime events and conventions
                    - Anime/manga creators and artists
                    Respond with "false" if the message is completely unrelated to these topics.`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 10,
            temperature: 0.3
        });

        return validationResponse.choices[0].message.content.toLowerCase().includes('true');
    } catch (error) {
        console.error('Error validating anime query:', error);
        return containsAnimeKeywords(message);
    }
};

const generateResponse = async (message) => {
    try {
        // Handle greetings specially
        if (isGreeting(message)) {
            return {
                response: "Konnichiwa! ✨ I'm your anime companion! Let's talk about your favorite anime, manga, and everything in between!",
                isAnimeRelated: true
            };
        }

        const isValidQuery = await isAnimeRelated(message);

        if (!isValidQuery) {
            return {
                response: "Gomen ne! 🙇‍♀️ I can only talk about anime, manga, and Japanese animation. Please ask me something related to those topics!",
                isAnimeRelated: false
            };
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an enthusiastic anime expert assistant with a friendly, upbeat personality.
                    You have extensive knowledge about anime, manga, and Japanese animation.
                    
                    Communication style:
                    - Use casual, friendly language with occasional Japanese expressions
                    - Express excitement about anime topics with emojis ✨
                    - Address users warmly but professionally
                    - Include interesting facts and recommendations when relevant
                    
                    Knowledge areas:
                    - Anime and manga series plots, characters, and themes
                    - Japanese animation studios and their works
                    - Voice actors and production staff
                    - Anime industry trends and history
                    - Japanese animation techniques and terminology
                    - Anime culture and fandom
                    
                    Always provide accurate, detailed information while maintaining an engaging conversation style.
                    Feel free to suggest related anime or manga based on the topic being discussed.`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return {
            response: completion.choices[0].message.content,
            isAnimeRelated: true
        };
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
};

export default generateResponse;