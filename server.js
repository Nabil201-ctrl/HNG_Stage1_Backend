import express from 'express';
import crypto from 'crypto';
import parseNaturalLanguageQuery from './utils/Natural_Language_Parser.js';
import applyFilters from './utils/filter_logic.js';

const app = express();
app.use(express.json());

// In-memory database
const Database = new Map();

// Input sanitization helper
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return null;
    return input.trim();
};

// POST /strings - Create/Analyze String
app.post('/strings', (req, res) => {
    try {
        const { value } = req.body;

        // Validate input
        if (!req.body || value === undefined) {
            return res.status(400).json({ error: 'Missing "value" field' });
        }

        const sanitizedValue = sanitizeInput(value);
        if (!sanitizedValue) {
            return res.status(422).json({ error: 'Invalid data type for "value" (must be non-empty string)' });
        }

        // Generate SHA-256 hash
        const hash = crypto.createHash('sha256').update(sanitizedValue).digest('hex');

        // Check for existing string
        if (Database.has(hash)) {
            return res.status(409).json({ error: 'String already exists in the system' });
        }

        // Compute character frequency map
        const character_frequency_map = {};
        for (let char of sanitizedValue) {
            character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
        }

        // Compute properties
        const is_palindrome = sanitizedValue.toLowerCase() ===
            sanitizedValue.toLowerCase().split('').reverse().join('');
        const word_count = sanitizedValue.trim() === ''
            ? 0
            : sanitizedValue.trim().split(/\s+/).length;

        const record = {
            id: hash,
            value: sanitizedValue,
            properties: {
                length: sanitizedValue.length,
                is_palindrome,
                unique_characters: Object.keys(character_frequency_map).length,
                word_count,
                sha256_hash: hash,
                character_frequency_map
            },
            created_at: new Date().toISOString()
        };

        Database.set(hash, record);
        return res.status(201).json(record);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /strings/:string_value - Get Specific String
app.get('/strings/:string_value', (req, res) => {
    try {
        const { string_value } = req.params;
        const sanitizedValue = sanitizeInput(string_value);
        if (!sanitizedValue) {
            return res.status(400).json({ error: 'Invalid string value' });
        }

        const hash = crypto.createHash('sha256').update(sanitizedValue).digest('hex');
        const entry = Database.get(hash);

        if (!entry) {
            return res.status(404).json({ error: 'String does not exist in the system' });
        }

        return res.json(entry);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /strings - Get All Strings with Filtering
app.get('/strings', (req, res) => {
    try {
        const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

        // Validate query parameters
        if (is_palindrome && !['true', 'false'].includes(is_palindrome)) {
            return res.status(400).json({ error: 'Invalid value for "is_palindrome" (must be true or false)' });
        }

        const minLen = min_length ? Number(min_length) : undefined;
        if (min_length && (isNaN(minLen) || minLen < 0 || !Number.isInteger(minLen))) {
            return res.status(400).json({ error: 'Invalid value for "min_length" (must be non-negative integer)' });
        }

        const maxLen = max_length ? Number(max_length) : undefined;
        if (max_length && (isNaN(maxLen) || maxLen < 0 || !Number.isInteger(maxLen))) {
            return res.status(400).json({ error: 'Invalid value for "max_length" (must be non-negative integer)' });
        }

        if (minLen !== undefined && maxLen !== undefined && minLen > maxLen) {
            return res.status(400).json({ error: 'Invalid range: min_length cannot be greater than max_length' });
        }

        const wordCount = word_count ? Number(word_count) : undefined;
        if (word_count && (isNaN(wordCount) || wordCount < 0 || !Number.isInteger(wordCount))) {
            return res.status(400).json({ error: 'Invalid value for "word_count" (must be non-negative integer)' });
        }

        const sanitizedChar = sanitizeInput(contains_character);
        if (contains_character && (!sanitizedChar || sanitizedChar.length !== 1)) {
            return res.status(400).json({ error: 'Invalid value for "contains_character" (must be a single character)' });
        }

        const results = [...Database.values()].filter(entry => {
            const { is_palindrome: entryIsPalindrome, length, word_count: entryWordCount, character_frequency_map } = entry.properties;

            return (
                (is_palindrome === undefined || entryIsPalindrome === (is_palindrome === 'true')) &&
                (minLen === undefined || length >= minLen) &&
                (maxLen === undefined || length <= maxLen) &&
                (wordCount === undefined || entryWordCount === wordCount) &&
                (sanitizedChar === null || (character_frequency_map[sanitizedChar] > 0))
            );
        });

        return res.json({
            data: results,
            count: results.length,
            filters_applied: req.query
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /strings/filter-by-natural-language - Natural Language Filtering
app.get('/strings/filter-by-natural-language', (req, res) => {
    try {
        const { query } = req.query;
        const sanitizedQuery = sanitizeInput(query);

        if (!sanitizedQuery) {
            return res.status(400).json({ error: 'Missing or empty "query" parameter' });
        }

        const parsedFilters = parseNaturalLanguageQuery(sanitizedQuery);

        if (!parsedFilters) {
            return res.status(400).json({ error: 'Unable to parse natural language query' });
        }

        // Validate parsed filters
        if (parsedFilters.min_length && parsedFilters.max_length && parsedFilters.min_length > parsedFilters.max_length) {
            return res.status(422).json({ error: 'Query parsed but resulted in conflicting filters' });
        }

        const results = applyFilters(Database, parsedFilters);

        return res.json({
            data: results,
            count: results.length,
            interpreted_query: {
                original: sanitizedQuery,
                parsed_filters: parsedFilters
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /strings/:string_value - Delete String
app.delete('/strings/:string_value', (req, res) => {
    try {
        const { string_value } = req.params;
        const sanitizedValue = sanitizeInput(string_value);
        if (!sanitizedValue) {
            return res.status(400).json({ error: 'Invalid string value' });
        }

        const hash = crypto.createHash('sha256').update(sanitizedValue).digest('hex');
        if (Database.delete(hash)) {
            return res.status(204).send();
        }

        return res.status(404).json({ error: 'String does not exist in the system' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});