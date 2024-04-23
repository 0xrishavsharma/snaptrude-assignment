import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 8080;
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
    console.error("Missing MAPBOX_ACCESS_TOKEN in .env file");
    process.exit(1);
}

const app = express();
app.use(cors());

app.get("/api/static-map", async (req: Request, res: Response) => {
    try {
        const { lng, lat, zoom } = req.query;
        if (
            !lng ||
            !lat ||
            !zoom ||
            typeof lng !== "string" ||
            typeof lat !== "string" ||
            typeof zoom !== "string"
        ) {
            return res.status(400).json({
                error: "Missing query parameters",
            });
        }

        const response = await axios.get(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/700x500?access_token=${MAPBOX_ACCESS_TOKEN}`,
            { responseType: "arraybuffer" }
        );

        res.setHeader("Content-Type", "image/png");
        res.send(Buffer.from(response.data, "binary"));
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({
            error: "Error fetching static map",
        });
        return;
    }
});

app.get(
    "/api/search-suggest",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req.query;
            if (!query || typeof query !== "string") {
                return res.status(400).json({
                    error: "Query parameter is missing",
                });
            }

            const sessionToken = Math.random().toString(36).substring(2, 15);

            const response = await axios.get(
                `https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${query}&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`
            );

            res.json(response?.data);
        } catch (error: any) {
            console.error("Error", error);
            res.status(500).json({
                error: "Error fetching search suggestions",
            });
            return;
        }
    }
);

app.use((err: Error, req: Request, res: Response) => {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).send(err.message);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
