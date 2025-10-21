import crypto from 'crypto'; 
    
export default function analyzeString(value) {
    const hash = crypto.createHash('sha256').update(value).digest('hex');

    // frequencies
    const characterFrequency = {};
    for (let char of value) {
        characterFrequency[char] = (characterFrequency[char] || 0) + 1;
    }

    // Check if string is palindrome (case-insensitive)
    const cleanedString = value.toLowerCase();
    const isPalindrome = cleanedString === cleanedString.split('').reverse().join('');

    // Count words (handle empty strings)
    const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

    return {
        id: hash,
        value: value,
        properties: {
            length: value.length,
            is_palindrome: isPalindrome,
            unique_characters: Object.keys(characterFrequency).length,
            word_count: wordCount,
            sha256_hash: hash,
            character_frequency_map: characterFrequency
        },
        created_at: new Date().toISOString()
    };
}