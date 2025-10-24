import express from "express";
import cors from "cors";

import router from "./router"

const app = express();
app.use(cors());
app.use(express.json());

app.use(router);

const PORT = Number(process.env.API_PORT || 5050);
app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});

export default app;
