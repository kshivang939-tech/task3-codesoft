import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ["Tops", "Bottoms", "Outerwear", "Accessories"] },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  color: { type: String, default: "Everyday colour" },
  image: { type: String, required: true },
  badge: { type: String, default: "" },
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["demo_pending", "paid", "failed"], default: "demo_pending" },
  orderStatus: { type: String, enum: ["placed", "processing", "shipped", "delivered", "cancelled"], default: "placed" }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
export const User = mongoose.model("User", userSchema);
export const Order = mongoose.model("Order", orderSchema);
