// utils/Natural_Language_Parser.js
export default function parseNaturalLanguageQuery(query) {
    query = query.toLowerCase();

    const filters = {};

    if (query.includes('single word') || query.includes('one word')) {
        filters.word_count = 1;
    }

    if (query.includes('palindromic') || query.includes('palindrome')) {
        filters.is_palindrome = true;
    }

    const longerMatch = query.match(/longer than (\d+) characters/);
    if (longerMatch) {
        filters.min_length = Number(longerMatch[1]) + 1;
    }

    const letterMatch = query.match(/letter ([a-z])/);
    if (letterMatch) {
        filters.contains_character = letterMatch[1];
    }

    if (query.includes('first vowel')) {
        filters.contains_character = 'a';
    }

    return Object.keys(filters).length > 0 ? filters : null;
}