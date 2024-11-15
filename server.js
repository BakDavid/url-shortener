import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// In-memory storage for URLs
const urlDatabase = {};

// Endpoint to shorten a URL
app.post("/shorten", (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ error: "Original URL is required" });
    }

    const shortId = nanoid(8); // Generate a unique ID
    const baseUrl = `${req.protocol}://${req.get("host")}`; // Dynamically determine the base URL
    const shortUrl = `${baseUrl}/${shortId}`;
    urlDatabase[shortId] = originalUrl;

    res.json({ shortUrl });
});

// Endpoint to get all shortened URLs
app.get("/urls", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`; // Dynamically determine the base URL
    const urls = Object.entries(urlDatabase).map(([id, originalUrl]) => ({
        shortUrl: `${baseUrl}/${id}`,
        originalUrl: originalUrl,
    }));
    res.json(urls);
});

// Endpoint to redirect to the original URL
app.get("/:id", (req, res) => {
    const originalUrl = urlDatabase[req.params.id];
    if (originalUrl) {
        return res.redirect(originalUrl);
    } else {
        return res.status(404).json({ error: "URL not found" });
    }
});

// Route for the landing page
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>URL Shortener API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                .endpoint {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 10px 0;
                }
                pre {
                    background: #eee;
                    padding: 10px;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <h1>URL Shortener API</h1>
            <div class="endpoint">
                <h2>1. Shorten a URL</h2>
                <p><strong>Endpoint:</strong> <code>/shorten</code></p>
                <p><strong>Method:</strong> POST</p>
                <p><strong>Request Body:</strong></p>
                <pre>{
    "originalUrl": "https://www.example.com"
}</pre>
                <p><strong>Example cURL:</strong></p>
                <pre>curl -X POST ${req.protocol}://${req.get(
        "host"
    )}/shorten -H "Content-Type: application/json" -d '{"originalUrl": "https://www.example.com"}'</pre>
            </div>
            <div class="endpoint">
                <h2>2. Get All Shortened URLs</h2>
                <p><strong>Endpoint:</strong> <code>/urls</code></p>
                <p><strong>Method:</strong> GET</p>
                <p><strong>Example cURL:</strong></p>
                <pre>curl ${req.protocol}://${req.get("host")}/urls</pre>
            </div>
            <div class="endpoint">
                <h2>3. Redirect to Original URL</h2>
                <p><strong>Endpoint:</strong> <code>/:id</code></p>
                <p><strong>Method:</strong> GET</p>
                <p><strong>Example:</strong> If the shortened URL is <code>${
                    req.protocol
                }://${req.get(
        "host"
    )}/abc123</code>, it will redirect to the original URL.</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
