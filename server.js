import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

app.post('/string', (req, res) => {
    const { input } = req.body;

    // SHA-256 hash
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    // Character frequency map
    let character_frequency_map = {};
    for (let char of input) {
        character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }

    // Palindrome check (I took time on this)
    const is_palindrome = input.toLowerCase() === input.toLowerCase().split('').reverse().join('');
    console.log(`Palindrome check for "${input}": ${is_palindrome}`);

    // Word count
    const word_count = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
    console.log(`Word count for "${input}": ${word_count}`);

    return res.json({
        id: hash,
        value: input,
        properties: {
            length: input.length,
            is_palindrome,
            unique_characters: Object.keys(character_frequency_map).length,
            word_count,
            sha256_hash: hash,
            character_frequency_map: character_frequency_map
        },
        created_at: new Date().toISOString()
    });
});

//One out of 4 endpoints created
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
