import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./Routes/UserRouter.js";
import moviesRouter from "./Routes/MoviesRouter.js";
import categoriesRouter from "./Routes/CategoriesRouter.js";

import { errorHandler } from "./Middlewares/errorMiddleware.js";
import Uploadrouter from "./Controllers/UploadFile.js";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://frontend-movie-git-main-nguyn-phan-hoai-nams-projects.vercel.app/",
    credentials: true,
  })
);
app.use(express.json());
//connect DB

connectDB();

//Main Route
app.get("/", (req, res) => {
  res.send("API is running...");
});
//Other Routes

app.use("/api/users", userRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", Uploadrouter);

//error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in http://localhost/${PORT}`);
});
