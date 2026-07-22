const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels in the client, we have to use the REST API or discovery
    console.log("Checking model availability...");
    // Let's try gemini-1.0-pro which is very stable
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hi");
    console.log("gemini-pro success:", result.response.text());
  } catch (err) {
    console.error("gemini-pro failed:", err.message);
  }
}

listModels();
