import express, { Request, Response } from "express";
import dotenv from "dotenv";
import router from "./routes/index.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.json({
    message: "NOT FOUND",
    code: 401,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
