const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function testKey() {
    console.log("🔍 Checking API Key...");

    // 1. Read .env.local
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ Error: .env.local file not found!");
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);

    if (!match || !match[1]) {
        console.error("❌ Error: GEMINI_API_KEY not found in .env.local");
        return;
    }

    const apiKey = match[1].trim();
    console.log(`🔑 Key found: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

    try {
        console.log("📡 Testing generation with gemini-2.0-flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say 'Hello'");
        console.log("✅ SUCCESS!");
        console.log("Response:", (await result.response).text());

    } catch (error) {
        console.error("❌ API CONNECTION FAILED");
        console.error("Error details:", error.message);
    }
}

testKey();
