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

        // Database se active listings ka context
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(20);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night). Amenities: ${l.amenities ? l.amenities.join(', ') : 'Standard'}`
            ).join("\n");
        } catch (dbErr) {
            console.error("Error fetching listings for AI context:", dbErr);
        }

        const systemPrompt = `
You are 'StayHub AI', an enthusiastic and knowledgeable travel concierge for the StayHub platform.
Here is the current list of available stays in our catalog:
${listingsContext || "Multiple vacation rentals across India."}

Guidelines:
1. Answer the user's travel and booking queries politely and concisely (2-4 sentences or quick bullets).
2. If the user asks for recommendations, match stays from the catalog with their prices.
3. Keep the tone warm, welcoming, and helpful.
`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt 
        });

        const result = await model.generateContent(message);
        const responseText = result.response.text();

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ 
            reply: "I'm having trouble generating a response right now. Please try again in a moment!" 
        });
    }
};

module.exports = { handleAIChat };