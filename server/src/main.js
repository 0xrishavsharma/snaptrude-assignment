"use strict"
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
const express_1 = __importDefault(require("express"))
const axios_1 = __importDefault(require("axios"))
const cors_1 = __importDefault(require("cors"))
const dotenv_1 = __importDefault(require("dotenv"))
dotenv_1.default.config()
const PORT = process.env.PORT || 8080
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
if (!MAPBOX_ACCESS_TOKEN) {
  console.error("Missing MAPBOX_ACCESS_TOKEN in .env file")
  process.exit(1)
}
const app = (0, express_1.default)()
app.use((0, cors_1.default)())
app.get("/api/static-map", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { lng, lat, zoom } = req.query
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
        })
      }
      const response = yield axios_1.default.get(
        `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/700x500?access_token=${MAPBOX_ACCESS_TOKEN}`,
        { responseType: "arraybuffer" },
      )
      res.setHeader("Content-Type", "image/png")
      res.send(Buffer.from(response.data, "binary"))
    } catch (error) {
      console.error("Error", error)
      res.status(500).json({
        error: "Error fetching static map",
      })
      return
    }
  }),
)
app.get("/api/search-suggest", (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { query } = req.query
      if (!query || typeof query !== "string") {
        return res.status(400).json({
          error: "Query parameter is missing",
        })
      }
      const sessionToken = Math.random().toString(36).substring(2, 15)
      const response = yield axios_1.default.get(
        `https://api.mapbox.com/search/searchbox/v1/suggest?limit=5&language=en&q=${query}&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}`,
      )
      res.json(
        response === null || response === void 0 ? void 0 : response.data,
      )
    } catch (error) {
      console.error("Error", error)
      res.status(500).json({
        error: "Error fetching search suggestions",
      })
      return
    }
  }),
)
app.use((err, req, res) => {
  console.error(err.message)
  console.error(err.stack)
  res.status(500).send(err.message)
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
