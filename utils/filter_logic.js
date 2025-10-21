// utils/filter_logic.js
export default function applyFilters(Database, filters) {
    return [...Database.values()].filter(entry => {
        const { is_palindrome, length, word_count, character_frequency_map } = entry.properties;

        return (
            (filters.is_palindrome === undefined || is_palindrome === filters.is_palindrome) &&
            (filters.min_length === undefined || length >= filters.min_length) &&
            (filters.max_length === undefined || length <= filters.max_length) &&
            (filters.word_count === undefined || word_count === filters.word_count) &&
            (filters.contains_character === undefined || character_frequency_map[filters.contains_character] > 0)
        );
    });
}