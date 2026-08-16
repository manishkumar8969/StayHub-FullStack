const { GoogleGenAI } = require("@google/genai");
const Listing = require("../models/Listing");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
});

const handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
            return res.status(200).json({
                reply: "GEMINI_API_KEY is not configured in environment variables!"
            });
        }

        // 1. Database se active listings context lena
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(10);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night)`
            ).join("\n");
        } catch (dbErr) {
            console.error("Listing context error:", dbErr.message);
        }

        const inputPrompt = `You are StayHub AI, a helpful travel concierge for the StayHub booking platform.
Available catalog stays:
${listingsContext || "Standard stays available across India."}

User Question: ${message}

Instructions:
1. Provide a concise, warm, and helpful answer (2-4 sentences).
2. Recommend stays from the catalog if relevant.`;

        // 2. Call Interactions API using the new official SDK
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: inputPrompt,
        });

        const replyText = interaction.output_text || "Namaste! How can I help you with StayHub today?";

        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error("Gemini Interactions API Error:", error);
        return res.status(200).json({ 
            reply: `AI Error: ${error.message || "Failed to generate response"}` 
        });
    }
};

module.exports = { handleAIChat };