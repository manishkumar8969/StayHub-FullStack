const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/Listing");

const handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({
                reply: "AI is currently in setup mode. Please ensure GEMINI_API_KEY is configured in the environment variables!"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Database context
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(15);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night)`
            ).join("\n");
        } catch (dbErr) {
            console.error("Listing fetch context error:", dbErr.message);
        }

        const prompt = `You are StayHub AI, a friendly travel concierge for the StayHub booking platform.
Available catalog stays:
${listingsContext || "Multiple vacation stays across India."}

User says: "${message}"

Respond politely, concisely, and suggest stays from the catalog if relevant.`;

        // Model list with automatic fallback
        const modelNames = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-2.0-flash", "gemini-pro"];
        let responseText = null;
        let lastError = null;

        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (responseText) {
            return res.status(200).json({ reply: responseText });
        }

        throw lastError || new Error("Failed to generate response across models");

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(200).json({ 
            reply: "Namaste! I am currently unable to generate a response. Please try again shortly." 
        });
    }
};

module.exports = { handleAIChat };