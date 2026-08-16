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

        // Active listings context safely fetch karna
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(15);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night)`
            ).join("\n");
        } catch (dbErr) {
            console.error("Listing fetch context error:", dbErr.message);
        }

        const systemInstruction = `You are StayHub AI, a helpful travel concierge for the StayHub booking platform.
Available catalog stays:
${listingsContext || "Multiple vacation stays across India."}

Respond politely, concisely, and suggest stays from the catalog if relevant.`;

        // Standard 1.5 Flash model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        const result = await model.generateContent(message);
        const responseText = result.response.text();

        return res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Gemini API Full Error:", error);
        return res.status(200).json({ 
            reply: `AI connection error: ${error.message || "Please check API key permissions"}` 
        });
    }
};

module.exports = { handleAIChat };