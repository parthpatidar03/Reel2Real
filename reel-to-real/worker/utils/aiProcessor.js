const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe audio using OpenAI Whisper
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioPath) {
    try {
        const fs = require('fs');

        console.log('Transcribing audio with Whisper...');

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
            language: 'en',
            response_format: 'text'
        });

        console.log('Transcription completed');
        return transcription;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

/**
 * Extract entities from combined text using GPT-4
 * @param {string} transcript - Audio transcript
 * @param {string[]} ocrTexts - OCR extracted texts
 * @returns {Promise<Object>} - Extracted entities
 */
async function extractEntities(transcript, ocrTexts) {
    try {
        const combinedText = `
AUDIO TRANSCRIPT:
${transcript || 'No audio transcript available'}

VISUAL TEXT (from video frames):
${ocrTexts && ocrTexts.length > 0 ? ocrTexts.join(' | ') : 'No text detected in frames'}
    `.trim();

        const prompt = `You are a venue extraction specialist analyzing Instagram Reel content.

Extract venue information from the following content and return ONLY valid JSON.

CONTENT:
${combinedText}

INSTRUCTIONS:
1. Identify the PRIMARY venue being discussed (if multiple mentioned, choose the main one)
2. Extract the venue name (exact as mentioned or shown)
3. Extract the full address if available (street, city, state/country)
4. Extract specific specialties or notable items mentioned (dishes, drinks, features)
5. Determine the category (cafe, restaurant, bar, bakery, food_truck, or other)

RULES:
- If information is missing or uncertain, use null
- Specialties should be specific items/dishes, not generic adjectives
- Address should be as complete as possible
- Return ONLY the JSON object, no additional text

REQUIRED JSON FORMAT:
{
  "name": "venue name or null",
  "address": "full address or null",
  "city": "city name or null",
  "specialties": ["item1", "item2"] or [],
  "category": "cafe|restaurant|bar|bakery|food_truck|other"
}`;

        console.log('Extracting entities with GPT-4...');

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise venue information extractor. Return only valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent output
            max_tokens: 500
        });

        const content = response.choices[0].message.content.trim();

        // Parse JSON response
        let entities;
        try {
            // Remove markdown code blocks if present
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : content;
            entities = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Error parsing GPT-4 response:', content);
            throw new Error('Failed to parse entity extraction response');
        }

        console.log('Entity extraction completed:', entities);
        return entities;
    } catch (error) {
        console.error('Error extracting entities:', error);
        throw error;
    }
}

module.exports = {
    transcribeAudio,
    extractEntities
};
