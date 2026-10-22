import { Router } from "express";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { Order, Product } from "../models.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const rawItems = req.body.items;
    const rawAddress = req.body.shippingAddress || {};
    if (!Array.isArray(rawItems) || rawItems.length < 1 || rawItems.length > 30) {
      return res.status(400).json({ message: "Your bag is empty or has too many different items." });
    }
    const address = {
      address: String(rawAddress.address || "").trim().slice(0, 200),
      city: String(rawAddress.city || "").trim().slice(0, 80),
      pincode: String(rawAddress.pincode || "").trim(),
      phone: String(rawAddress.phone || "").trim()
    };
    if (!address.address || !address.city || !/^\d{6}$/.test(address.pincode) || !/^\d{10}$/.test(address.phone)) {
      return res.status(400).json({ message: "Enter a valid address, city, 6-digit PIN code and 10-digit phone number." });
    }

    const quantities = new Map();
    for (const item of rawItems) {
      if (!mongoose.isValidObjectId(item.productId)) return res.status(400).json({ message: "One of the products is invalid." });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: "Each quantity must be between 1 and 20." });
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
    }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] }, inStock: true });
    if (products.length !== quantities.size) return res.status(400).json({ message: "A product is no longer available. Refresh your bag and try again." });
    const items = products.map(p => ({
      product: p._id, name: p.name, image: p.image, unitPrice: p.price, quantity: quantities.get(p._id.toString())
    }));
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shipping = subtotal >= 2499 ? 0 : 99;
    const order = await Order.create({
      orderNumber: `SE-${Date.now().toString().slice(-7)}-${randomBytes(2).toString("hex").toUpperCase()}`,
      user: req.userId, items, shippingAddress: address, subtotal, shipping, total: subtotal + shipping,
      paymentStatus: "demo_pending"
    });
    res.status(201).json({ message: "Demo order placed. No payment was collected.", order: {
      orderNumber: order.orderNumber, subtotal: order.subtotal, shipping: order.shipping, total: order.total,
      paymentStatus: order.paymentStatus, orderStatus: order.orderStatus
    }});
  } catch (error) { next(error); }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).select("-shippingAddress").lean();
    res.json({ orders });
  } catch (error) { next(error); }
});

export default router;
