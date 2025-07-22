
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config(); // Call .config() immediately after importing

const API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize the Generative AI client
let genAI;
try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  } else {
    // If no API key is provided, log a warning for local dev.
    console.warn("GEMINI_API_KEY not found in environment variables. Attempting to initialize without explicit key (might rely on runtime environment or default credentials).");
    genAI = new GoogleGenerativeAI(); // Attempt to initialize without key
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenerativeAI:", error);
 
}


/**
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
export const summarizeText = async (req, res) => {
  try {
    const { content } = req.body; // Extract content from the request body

    // Validate input content
    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return res.status(400).json({
        error: 'Insufficient content to summarize. Please provide at least 20 characters of text.',
        details: 'Content must be a non-empty string of at least 20 characters.'
      });
    }

    if (!genAI) {
      console.error("GoogleGenerativeAI client was not initialized. Check API key configuration or environment.");
      return res.status(500).json({
        error: 'AI summarization service is unavailable. Please check backend configuration.',
        details: 'API client could not be initialized.'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Please provide a concise summary of the following content. Focus on the main points and keep it brief, around 3-5 sentences. If the content is very short, summarize it as best as you can in 1-2 sentences. Do not include any introductory or concluding phrases like "Here's a summary:" or "In conclusion:". Just provide the summary:\n\n${content}`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const summary = response.text();

    res.status(200).json({ summary });

  } catch (error) {
    console.error('AI Summarization Error:', error); // Log the full error for debugging

    if (error.response && error.response.status) {
      // If there's an HTTP response from the API, relay its status and message
      return res.status(error.response.status).json({
        error: `Gemini API Error (${error.response.status}): ${error.response.statusText || 'Unknown API Error'}`,
        details: error.message || 'An error occurred while communicating with the Gemini API.'
      });
    } else if (error.message && error.message.includes('API key not valid')) {
       return res.status(401).json({
           error: 'Invalid API Key',
           details: 'Please check your GEMINI_API_KEY in the .env file or environment variables.'
       });
    } else {
      // General server error
      res.status(500).json({
        error: 'Failed to generate summary from AI.',
        details: error.message || 'An unexpected error occurred during summarization.'
      });
    }
  }
};

export const generateTitleDescription = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title too short to generate description.' });
    }

    if (!genAI) {
      console.error('❌ Gemini client not initialized.');
      return res.status(500).json({ error: 'Gemini client not initialized.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a creative and compelling 1–2 sentence description for a blog, video, or post titled "${title}". The description should be engaging and informative, like a summary teaser, without repeating the title or saying "this content is about." Just make it sound like a natural intro paragraph for a reader.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ description: text.trim() });

  } catch (error) {
    console.error('❌ Description Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate description.',
      details: error.message || 'Unknown error occurred.',
    });
  }
};

// controllers/aiController.js
export const handleAITags = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title too short to generate tags.' });
    }

    if (!genAI) {
      console.error('❌ Gemini client not initialized.');
      return res.status(500).json({ error: 'Gemini client not initialized.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Based on the title "${title}", generate 5 relevant, popular social media hashtags (each starting with #). Format them as a comma-separated list. Only return the tags, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Optional: Validate or sanitize response here
    res.status(200).json({ tags: text });

  } catch (error) {
    console.error('❌ Tag Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate tags.',
      details: error.message || 'Unknown error occurred.',
    });
  }
};
