import express, { Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes/index.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "HeadFams backend is running" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "NOT FOUND",
    code: 404,
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
