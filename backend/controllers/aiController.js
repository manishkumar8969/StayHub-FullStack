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
                reply: "GEMINI_API_KEY is not defined in environment variables!"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Fetch sample catalog
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(10);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night)`
            ).join("\n");
        } catch (dbErr) {
            console.error("Listing fetch context error:", dbErr.message);
        }

        const prompt = `You are StayHub AI, a travel concierge.
Catalog stays:
${listingsContext || "Standard stays available."}

User: ${message}

Provide a short, helpful response in English or Hindi.`;

        // Direct call to Gemini 2.5 Flash / 1.5 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Gemini Execution Error:", error);
        return res.status(200).json({ 
            reply: `Gemini Error: ${error.message || "Unknown error occurred"}` 
        });
    }
};

module.exports = { handleAIChat };