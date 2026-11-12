
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Izinkan website Go Live mengakses API
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        "http://127.0.0.1:5500"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.post("/api/chat", async (req, res) => {
    try {
        const key = process.env.HERMES_API_KEY;
        const message = req.body.message;

        if (!key) {
            return res.status(500).json({
                error: "API key belum diisi di .env"
            });
        }

        const response = await fetch(
            "http://127.0.0.1:8642/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "hermes-agent",
                    messages: [
                        {
                            role: "system",
                            content: "Kamu adalah Housepoint AI, asisten coffee shop. Jawab dalam Bahasa Indonesia."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    stream: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || data.error || "Hermes error"
            });
        }

        res.json({
            reply: data.choices?.[0]?.message?.content
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Gagal menghubungi Hermes Gateway"
        });
    }
});

app.listen(PORT, () => {
    console.log("Housepoint AI API aktif di port 3000");
});
