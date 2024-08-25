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
import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from "@clerk/clerk-sdk-node";
import "dotenv/config";
import "./db";

const app = express();
const PORT = process.env.PORT || 5000;

//configrations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

//routes
app.use("/protected-endpoint", ClerkExpressRequireAuth(), userRoute);
app.use("/user" , ClerkExpressRequireAuth() ,userRoute )
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/cartitems", cartItemsRoute);
app.use("/washlist", washlistRoute);
app.use("/order", ClerkExpressRequireAuth(), orderRoute);
app.use(globalError);

app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
