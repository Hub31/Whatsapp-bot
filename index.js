import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// 1. Setup Evolution API client
const client = new Evolution({
  authentication: {
    type: "singlefile",
    clientId: "mybot-session",
    dataPath: "./session.json"
  }
});

// 2. When WhatsApp is ready
client.on("ready", () => {
  console.log("✅ Bot is connected to WhatsApp!");
});

// 3. When a new message comes in
client.on("message", async (msg) => {
  if (!msg.fromMe) {
    try {
      // Send message text to OpenRouter
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo", // you can change model later
          messages: [{ role: "user", content: msg.body }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const aiReply = response.data.choices[0].message.content;

      // Reply back on WhatsApp
      client.sendText(msg.from, aiReply);
    } catch (err) {
      console.error("❌ Error:", err.message);
      client.sendText(msg.from, "Sorry, I had trouble answering!");
    }
  }
});

// 4. Start Evolution
client.initialize();

// 5. Start Express server (needed for Render)
app.get("/", (req, res) => res.send("WhatsApp Bot is running!"));
app.listen(10000, () => console.log("🚀 Server started on port 10000"));

