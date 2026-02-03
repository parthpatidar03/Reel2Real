const axios = require('axios');
const stringSimilarity = require('string-similarity');

/**
 * Resolve place using Google Places API
 * @param {Object} extractedData - Extracted venue data
 * @returns {Promise<Object>} - Resolved place with confidence score
 */
async function resolvePlace(extractedData) {
    try {
        const { name, address, city } = extractedData;

        if (!name) {
            return {
                confidence: 0,
                match: null,
                reason: 'No venue name extracted'
            };
        }

        // Build search query
        let searchQuery = name;
        if (address) {
            searchQuery += ` ${address}`;
        } else if (city) {
            searchQuery += ` ${city}`;
        }

        console.log(`Searching Google Places for: "${searchQuery}"`);

        // Search Google Places
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
            params: {
                input: searchQuery,
                inputtype: 'textquery',
                fields: 'place_id,name,formatted_address,geometry,rating,photos,types',
                key: process.env.GOOGLE_PLACES_API_KEY
            }
        });

        if (!response.data.candidates || response.data.candidates.length === 0) {
            console.log('No places found');
            return {
                confidence: 0,
                match: null,
                reason: 'No matching places found'
            };
        }

        const match = response.data.candidates[0];

        // Calculate confidence score
        const confidence = calculateConfidence(extractedData, match);

        console.log(`Place resolved with confidence: ${(confidence * 100).toFixed(1)}%`);

        return {
            confidence,
            match,
            reason: confidence >= 0.5 ? 'Match found' : 'Low confidence match'
        };
    } catch (error) {
        console.error('Error resolving place:', error.message);
        throw error;
    }
}

/**
 * Calculate confidence score for place match
 * @param {Object} extracted - Extracted data
 * @param {Object} apiMatch - Google Places API match
 * @returns {number} - Confidence score (0-1)
 */
function calculateConfidence(extracted, apiMatch) {
    let score = 0;

    // Name similarity (50% weight)
    if (extracted.name && apiMatch.name) {
        const nameSimilarity = stringSimilarity.compareTwoStrings(
            extracted.name.toLowerCase(),
            apiMatch.name.toLowerCase()
        );
        score += nameSimilarity * 0.5;
    }

    // Address similarity (30% weight)
    if (extracted.address && apiMatch.formatted_address) {
        const addressSimilarity = stringSimilarity.compareTwoStrings(
            extracted.address.toLowerCase(),
            apiMatch.formatted_address.toLowerCase()
        );
        score += addressSimilarity * 0.3;
    } else if (extracted.city && apiMatch.formatted_address) {
        // Partial credit if only city matches
        const cityInAddress = apiMatch.formatted_address.toLowerCase().includes(extracted.city.toLowerCase());
        score += (cityInAddress ? 0.5 : 0) * 0.3;
    }

    // Verification signals (20% weight)
    let verificationScore = 0;
    if (apiMatch.rating) verificationScore += 0.5; // Has rating
    if (apiMatch.photos && apiMatch.photos.length > 0) verificationScore += 0.25; // Has photos
    if (apiMatch.types && apiMatch.types.length > 0) verificationScore += 0.25; // Has types
    score += verificationScore * 0.2;

    return Math.min(score, 1.0);
}

/**
 * Get place details from Google Places
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Detailed place information
 */
async function getPlaceDetails(placeId) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                fields: 'name,formatted_address,geometry,rating,photos,types,website,formatted_phone_number',
                key: process.env.GOOGLE_PLACES_API_KEY
            }
        });

        return response.data.result;
    } catch (error) {
        console.error('Error getting place details:', error.message);
        throw error;
    }
}

module.exports = {
    resolvePlace,
    calculateConfidence,
    getPlaceDetails
};
