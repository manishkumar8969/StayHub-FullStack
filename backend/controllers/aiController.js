const { GoogleGenerativeAI } = require("@google/generative-ai");
const Listing = require("../models/Listing");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const handleAIChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Database se active listings ka brief context lena
        const listings = await Listing.find({}, "title location country price amenities").limit(20);
        
        const listingsContext = listings.map(l => 
            `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night). Amenities: ${l.amenities ? l.amenities.join(', ') : 'Standard'}`
        ).join("\n");

        const systemPrompt = `
You are 'StayHub AI', an enthusiastic and knowledgeable travel concierge for the StayHub platform.
Here is the current live list of available stays in our catalog:
${listingsContext}

Guidelines:
1. Answer the user's travel and booking queries politely and concisely (2-4 sentences or quick bullets).
2. If the user asks for recommendations, prioritize matching stays from the catalog above with their prices.
3. If they ask for an itinerary, give a short, actionable day-wise plan.
4. Keep the tone warm, welcoming, and helpful.
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
            reply: "I'm having trouble connecting to StayHub AI right now. Please try again in a moment!" 
        });
    }
};

module.exports = { handleAIChat };