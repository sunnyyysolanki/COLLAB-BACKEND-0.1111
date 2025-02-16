const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateResult } = require("../ai.service");

exports.getResult = async (req, res, prompt) => {
  try {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateResult(prompt);
    const generatedText = result; // Extract text correctly

    if (!generatedText) {
      return res.status(500).json({ error: "Failed to generate response" });
    }

    return res.status(200).json({ result: generatedText });
  } catch (error) {
    console.error("❌ Error generating AI response:", error?.message || error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error?.message });
  }
};
