import express from "express";
import axios from "axios";
const cors = require("cors");

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 8000;

const mapboxSecretToken = process.env.MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE;

app.use(cors());

app.get("/api/static-map", async (req, res) => {
    try {
        const { lng, lat, zoom } = req.query;

        const response = await axios.get(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/700x500?access_token=${mapboxSecretToken}`,
            { responseType: "arraybuffer" }
        );

        res.setHeader("Content-Type", "image/png");
        res.send(Buffer.from(response.data, "binary"));
    } catch (error) {
        res.status(500).json({
            error: "Error fetching static map",
        });
    }
});

app.get("/api/search-suggest", async (req, res) => {
    try {
        const { query } = req.query;
        console.log("Query", query);
        const sessionToken = Math.random().toString(36).substring(2, 15);

        const response = await axios.get(
            `https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${query}&access_token=${mapboxSecretToken}&session_token=${sessionToken}`
        );

        res.json(response?.data);
    } catch (error: any) {
        console.log("Error", error);
        res.status(500).json({
            error: error,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
