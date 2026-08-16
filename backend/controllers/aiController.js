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
                reply: "GEMINI_API_KEY is not configured in environment variables!"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Fetch catalog stays context
        let listingsContext = "";
        try {
            const listings = await Listing.find({}, "title location country price amenities").limit(10);
            listingsContext = listings.map(l => 
                `- ${l.title} in ${l.location}, ${l.country} (₹${l.price}/night)`
            ).join("\n");
        } catch (dbErr) {
            console.error("Listing fetch context error:", dbErr.message);
        }

        const prompt = `You are StayHub AI, a friendly travel concierge for the StayHub booking platform.
Available catalog stays:
${listingsContext || "Standard stays available across India."}

User Question: ${message}

Instructions:
1. Provide a concise, helpful, and warm reply (2-4 sentences).
2. Recommend stays from the catalog if relevant.`;

        // 2. Priority model list
        const priorityModels = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.0-flash-lite"];
        let responseText = null;
        let lastError = null;

        for (const modelName of priorityModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        // 3. Fallback: Dynamically query Google for available models if priority models fail
        if (!responseText) {
            try {
                const modelsResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const data = await modelsResp.json();
                
                const validModel = data.models?.find(m => 
                    m.supportedGenerationMethods?.includes("generateContent")
                );

                if (validModel) {
                    const fallbackModelName = validModel.name.replace("models/", "");
                    const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
                    const result = await fallbackModel.generateContent(prompt);
                    responseText = result.response.text();
                }
            } catch (fetchErr) {
                console.error("Auto-discovery error:", fetchErr);
            }
        }

        if (responseText) {
            return res.status(200).json({ reply: responseText });
        }

        throw lastError || new Error("Unable to connect to any Gemini model");

    } catch (error) {
        console.error("Gemini Final Error:", error);
        return res.status(200).json({ 
            reply: `AI Error: ${error.message || "Failed to generate response"}` 
        });
    }
};

module.exports = { handleAIChat };