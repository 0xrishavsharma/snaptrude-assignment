export const baseUrl =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_APP_BASE_URL
        : "http://localhost:8000";

export const mapboxPublicToken = import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN;
export const mapboxSecretToken = import.meta.env
    .VITE_APP_MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE;
export const mapStyle = import.meta.env.VITE_MAPBOX_STYLE_URL;
