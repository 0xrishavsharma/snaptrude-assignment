"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors = require("cors");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 8000;
const mapboxSecretToken = process.env.MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE;
app.use(cors());
app.get("/api/static-map", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lng, lat, zoom } = req.query;
        const response = yield axios_1.default.get(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/700x500?access_token=${mapboxSecretToken}`, { responseType: "arraybuffer" });
        res.setHeader("Content-Type", "image/png");
        res.send(Buffer.from(response.data, "binary"));
    }
    catch (error) {
        res.status(500).json({
            error: "Error fetching static map",
        });
    }
}));
app.get("/api/search-suggest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        console.log("Query", query);
        const sessionToken = Math.random().toString(36).substring(2, 15);
        const response = yield axios_1.default.get(`https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${query}&access_token=${mapboxSecretToken}&session_token=${sessionToken}`);
        res.json(response === null || response === void 0 ? void 0 : response.data);
    }
    catch (error) {
        console.log("Error", error);
        res.status(500).json({
            error: error,
        });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
