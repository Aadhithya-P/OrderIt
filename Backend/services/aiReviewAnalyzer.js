const axios = require("axios");

exports.analyzeReviewsWithAI = async (reviews) => {
    try{

        const reviewTexts = reviews.map((r) => r.Comment)

        const prompt = `
        Analyze ALL the following restaurant reviews together.

        Return ONLY valid JSON.
        Do NOT include markdown.
        Do NOT include \`\`\`json or \`\`\`.
        Do NOT include explanations or notes.
        Do NOT return an array.
        Return ONLY ONE JSON object.

        STRICT FORMAT:
        {
            "sentiment": "positive | negative | mixed",
            "summaryBullets": ["point1", "point2", "point3"],
            "topMentions": ["word1", "word2"]
        }

        IMPORTANT:
        - Combine all reviews into ONE overall result
        - Output must be pure JSON parsable by JSON.parse()
        - No extra text before or after JSON

        Reviews:
        ${reviewTexts.join("\n")}
        `;

        console.log("AI INPUT REVIEWS:", reviews);//temp
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
            }
        );

        console.log("RAW AI RESPONSE:", response.data);//temp
        const content = response.data.choices[0].message.content;
        console.log("AI CONTENT:", content);//temp
        return JSON.parse(content);


    }catch(error){
        console.error("AI Error", error);
        throw error;
    }
};  