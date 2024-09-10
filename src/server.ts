import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import globalError from "./middlewares/globalError";

//Routes
import userRoute from "./routes/userRoute";
import categoryRoute from "./routes/categoryRoute";
import productRoute from "./routes/productRoute";
import cartItemsRoute from "./routes/cartItemsRoute";
import washlistRoute from "./routes/washlistRoute";
import orderRoute from "./routes/orderRoute";
import mailsRoute from "./routes/mailsRoute";
import adminDashboardRoute from "./routes/adminDashboardRoute";

//cloudinary config
import "./config/cloudinary-config";

import "dotenv/config";
import "./db";

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.BASE_URL_FRONT_END,
};

// BASE_URL_FRONT_END

//configrations
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("common"));

//routes
app.use("/protected-endpoint", userRoute);

app.use("/user", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/cartitems", cartItemsRoute);
app.use("/washlist", washlistRoute);
app.use("/order", orderRoute);
app.use("/mails", mailsRoute);
app.use("/admin-dashboard", adminDashboardRoute);
app.use(globalError);

app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
