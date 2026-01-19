/**
 * MCP Client Service
 * Uses MCP REST API for AI-powered content generation
 * This replaces direct Gemini API calls to keep API keys secure on the server
 */

const MCP_API_URL = import.meta.env.VITE_MCP_API_URL || 'https://cbt-mcp-client-1065513777845.asia-southeast2.run.app';

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
 * Generate title and description from image using MCP Client
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<{title: string, description: string}>}
 */
export const generateFromImage = async (imageFile) => {
    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const prompt = `Analisis gambar ini dan berikan:

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
}`;

        const requestBody = {
            prompt: prompt,
            attachments: [
                {
                    name: imageFile.name || 'image.jpg',
                    mime_type: mimeType,
                    data: base64Image
                }
            ],
            agent: false  // Direct chat mode, no tool execution
        };

        const response = await fetch(`${MCP_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content');
        }

        const data = await response.json();

        // Extract the text response from MCP response format
        const textResponse = data.content;

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
        console.error('MCP Client Error:', error);
        throw error;
    }
};

export const mcpService = {
    generateFromImage
};
