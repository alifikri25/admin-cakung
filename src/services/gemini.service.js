/**
 * Gemini AI Service
 * Using gemini-2.5-flash-lite model for image analysis
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

/**
 * Convert file to base64 string
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Generate title and description from image using Gemini AI
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<{title: string, description: string}>}
 */
export const generateFromImage = async (imageFile) => {
    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        },
                        {
                            text: `Analisis gambar ini dan berikan:

1. **Judul**: Buat judul yang menarik dan informatif dalam Bahasa Indonesia (maksimal 100 karakter)

2. **Deskripsi**: Buat deskripsi detail dalam format Markdown dengan struktur berikut:
   - Gunakan heading, bullet points, atau numbered lists jika sesuai
   - Jelaskan konteks dan detail penting dari gambar
   - Tulis dalam Bahasa Indonesia yang baik dan benar
   - Panjang 2-4 paragraf

Berikan respons dalam format JSON seperti ini:
{
  "title": "Judul yang menarik",
  "description": "Deskripsi dalam format **markdown**..."
}`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate content');
        }

        const data = await response.json();

        // Extract the text response
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('No response generated');
        }

        // Parse JSON from response (may be wrapped in markdown code block)
        let jsonStr = textResponse;

        // Remove markdown code block if present
        const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const result = JSON.parse(jsonStr.trim());

        return {
            title: result.title || '',
            description: result.description || ''
        };
    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw error;
    }
};

export const geminiService = {
    generateFromImage
};
