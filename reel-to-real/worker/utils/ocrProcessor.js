const Tesseract = require('tesseract.js');

/**
 * Perform OCR on image frames
 * @param {string[]} framePaths - Array of frame file paths
 * @returns {Promise<string[]>} - Array of extracted texts
 */
async function performOCR(framePaths) {
    try {
        console.log(`Performing OCR on ${framePaths.length} frames...`);

        const ocrResults = [];

        // Process frames in batches to avoid memory issues
        const batchSize = 5;
        for (let i = 0; i < framePaths.length; i += batchSize) {
            const batch = framePaths.slice(i, i + batchSize);

            const batchPromises = batch.map(async (framePath) => {
                try {
                    const { data: { text, confidence } } = await Tesseract.recognize(
                        framePath,
                        'eng',
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        }
                    );

                    // Only include text with reasonable confidence
                    if (text.trim() && confidence > 60) {
                        return text.trim();
                    }
                    return null;
                } catch (error) {
                    console.error(`Error processing frame ${framePath}:`, error.message);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            ocrResults.push(...batchResults.filter(text => text !== null));
        }

        console.log(`OCR completed. Extracted ${ocrResults.length} text segments.`);
        return ocrResults;
    } catch (error) {
        console.error('Error performing OCR:', error);
        throw error;
    }
}

/**
 * Clean and deduplicate OCR results
 * @param {string[]} ocrTexts - Array of OCR texts
 * @returns {string[]} - Cleaned and deduplicated texts
 */
function cleanOCRResults(ocrTexts) {
    // Remove duplicates and very short texts
    const cleaned = [...new Set(ocrTexts)]
        .filter(text => text.length > 3)
        .map(text => text.replace(/\s+/g, ' ').trim());

    return cleaned;
}

module.exports = {
    performOCR,
    cleanOCRResults
};
