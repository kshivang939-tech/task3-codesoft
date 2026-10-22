import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "./models.js";

const products = [
  { name: "Everyday Oversized Tee", category: "Tops", price: 799, oldPrice: 999, badge: "BESTSELLER", color: "Sand", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", description: "A relaxed everyday cotton tee." },
  { name: "Relaxed Linen Shirt", category: "Tops", price: 1499, oldPrice: 1899, badge: "NEW", color: "White", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85", description: "An easy, airy layer." },
  { name: "Classic Straight Jeans", category: "Bottoms", price: 2199, oldPrice: 2599, color: "Blue", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85", description: "Classic straight-fit denim." },
  { name: "Minimal Everyday Hoodie", category: "Outerwear", price: 1899, oldPrice: 2299, badge: "POPULAR", color: "Grey", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85", description: "A soft hoodie for slow days." },
  { name: "Soft Knit Cardigan", category: "Outerwear", price: 2499, oldPrice: 2999, color: "Cream", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85", description: "A comfortable knit layer." },
  { name: "Weekend Utility Trousers", category: "Bottoms", price: 1799, oldPrice: 2099, color: "Olive", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85", description: "Relaxed utility-inspired trousers." },
  { name: "Daily Canvas Tote", category: "Accessories", price: 599, oldPrice: 799, badge: "ECO PICK", color: "Natural", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85", description: "A handy carry-all tote." },
  { name: "Modern Ribbed Tank", category: "Tops", price: 699, oldPrice: 899, color: "Black", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85", description: "A clean, easy layering piece." }
];

try {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing. Copy .env.example to .env first.");
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
