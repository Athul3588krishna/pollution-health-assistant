const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const { message, pollutionData } = req.body;

    const prompt = `
You are Tutu 1.0, developed by Aswathy T.

You are an AI assistant that helps people understand:
- AQI (Air Quality Index)
- Pollution levels
- Humidity
- Health risks caused by pollution

Always answer in simple language.

Current environmental data:
AQI: ${pollutionData?.aqi || "unknown"}
Humidity: ${pollutionData?.humidity || "unknown"}%
Temperature: ${pollutionData?.temperature || "unknown"}°C

User question:
${message}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({ reply });

  } catch (error) {

    console.log("Gemini error:", error.response?.data || error.message);

    res.status(500).json({
      reply: "AI error. Please try again."
    });

  }

});

module.exports = router;