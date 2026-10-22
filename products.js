import { Router } from "express";
import { Product } from "../models.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const filter = { inStock: true };
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: String(search).slice(0, 80), $options: "i" };
    const sortMap = { low: { price: 1 }, high: { price: -1 }, name: { name: 1 } };
    const products = await Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }).limit(100).lean();
    res.json({ products });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (error) { next(error); }
});

export default router;
