import mongoose, { Document, Schema } from "mongoose";

interface IProductStat extends Document {
  productId: mongoose.Schema.Types.ObjectId;
  year: number;
  monthlyData: { month: string; salesTotal: number; totalSold: number }[];
  dailyData: { date: string; salesTotal: number; totalSold: number }[];
  yearlySalesTotal: number;
  yearlyTotalSold: number;
}

const ProductStatSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
  year: { type: Number, required: true },
  monthlyData: [
    {
      month: { type: String, required: true },
      salesTotal: { type: Number, default: 0 },
      totalSold: { type: Number, default: 0 },
    },
  ],
  dailyData: [
    {
      date: { type: String, required: true },
      salesTotal: { type: Number, default: 0 },
      totalSold: { type: Number, default: 0 },
    },
  ],
  yearlySalesTotal: { type: Number, default: 0 },
  yearlyTotalSold: { type: Number, default: 0 },
});

const ProductStat = mongoose.model<IProductStat>(
  "ProductStat",
  ProductStatSchema
);

export default ProductStat;
