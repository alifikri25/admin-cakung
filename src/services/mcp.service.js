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
 * Build explicit prompt for image analysis
 * The prompt instructs the model exactly what to do with the image
 */
const buildImageAnalysisPrompt = () => {
    return `Kamu adalah AI yang bertugas menganalisis gambar untuk membuat konten berita/postingan website Kelurahan.

TUGAS UTAMA:
Lihat dan analisis gambar yang diberikan dengan cermat. Berdasarkan APA YANG TERLIHAT DI GAMBAR, buatkan:

1. JUDUL (title):
   - Buat judul berita yang menarik dan informatif
   - Harus mendeskripsikan apa yang terlihat di gambar
   - Maksimal 100 karakter
   - Dalam Bahasa Indonesia

2. DESKRIPSI (description):
   - Tulis deskripsi detail tentang gambar dalam format Markdown
   - Jelaskan: Apa yang terlihat? Siapa yang ada? Apa yang sedang terjadi? Di mana lokasinya?
   - Gunakan bullet points atau numbered list jika sesuai
   - Tulis 2-4 paragraf dalam Bahasa Indonesia yang baik
   - Cocokkan narasi dengan visual yang ada di gambar

PENTING:
- Fokus pada konten VISUAL yang terlihat di gambar
- Jangan berasumsi hal yang tidak terlihat di gambar
- Deskripsi harus akurat menggambarkan gambar

FORMAT RESPONS (JSON):
{
  "title": "Judul berita yang sesuai dengan gambar",
  "description": "Deskripsi markdown yang menjelaskan gambar..."
}

Sekarang analisis gambar yang diberikan dan berikan respons dalam format JSON di atas.`;
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

        const prompt = buildImageAnalysisPrompt();

        const requestBody = {
            prompt: prompt,
            attachments: [
                {
                    name: imageFile.name || 'image.jpg',
                    mime_type: mimeType,
                    data: base64Image
                }
            ],
            agent: false  // Direct chat mode, bypasses system prompts
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

        // Try to extract JSON object if text has extra content
        const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
            jsonStr = jsonObjectMatch[0];
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
