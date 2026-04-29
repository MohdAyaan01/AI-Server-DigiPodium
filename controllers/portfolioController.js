import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { Portfolio } from "../models/portfolioModel.js";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const GenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatePortfolio = async (req, res) => {
    try {
        const { prompt, style } = req.body;
        const resumeFile = req.file;

        let resumeText = "";

        // 1. Process Uploaded File (PDF or DOCX)
        if (resumeFile) {
            try {
                if (resumeFile.mimetype === 'application/pdf') {
                    const data = await pdf(resumeFile.buffer);
                    resumeText = data.text;
                }
                else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = await mammoth.extractRawText({ buffer: resumeFile.buffer });
                    resumeText = result.value;
                }
            } catch (extractError) {
                console.error("Text Extraction Error:", extractError);
            }
        }

        // 2. Initialize the AI Model
        const model = GenAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. Define Style Instructions
        const styleInstructions = {
            Professional: "Maintain a formal, corporate tone. Focus on clear achievements and industry-standard terminology.",
            Creative: "Use vibrant, descriptive, and enthusiastic language. Focus on storytelling and unique personality traits.",
            Minimalist: "Keep all text extremely concise and punchy. Use short sentences and eliminate all fluff.",
            Bold: "Use strong action verbs and confident, high-impact language. Make it sound assertive and ambitious."
        };

        const selectedStyleInfo = styleInstructions[style] || styleInstructions.Professional;

        // 4. Construct the Master Prompt
        const MasterPrompt = `
            You are a Professional Portfolio Builder.
            
            GENERATION STYLE: ${style || "Professional"}
            STYLE INSTRUCTIONS: ${selectedStyleInfo}

            USER RESUME CONTENT:
            ${resumeText || "No resume provided."}

            USER INSTRUCTIONS:
            ${prompt || "No specific instructions provided."}

            TASK:
            Based on the resume and style instructions, generate a detailed JSON object for a professional portfolio.
            
            THE JSON MUST INCLUDE:
            - fullName
            - professionalBio (Vary this based on the STYLE)
            - skills (Object with categories like "Frontend", "Backend", etc.)
            - projects (Array with title, description, and techStack)
            - contactInfo (Object with email, linkedin, github)
            - background with cool gradient and built like original portfolio other website not provide...

            Only return the JSON object. No Markdown, no backticks, no text.
        `;

        // 5. Generate Content with Gemini
        const result = await model.generateContent(MasterPrompt);
        const response = await result.response;
        const text = response.text();

        // 6. Robust JSON Extraction
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("AI failed to return a valid JSON structure.");
        }

        const jsonString = text.slice(jsonStart, jsonEnd);
        const parsedPortfolio = JSON.parse(jsonString);
        // Add this check before creating new Portfolio (around line 92)


        // Inside generatePortfolio function (around line 92)
        // Change the check to:
        if (!req.id) {
            return res.status(401).json({ message: "User not authenticated. Please login again." });
        }

        // And change the Portfolio creation (line 97) to:
        const newPortfolio = new Portfolio({
            userId: req.id, // Use req.id from middleware
            templateId: style || "Professional",
            content: parsedPortfolio
        });

        await newPortfolio.save();
        res.status(200).json(newPortfolio)
    } catch (error) {
        console.error("Critical Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate portfolio. Try Again Later",
            error: error.message
        });
    }
};
