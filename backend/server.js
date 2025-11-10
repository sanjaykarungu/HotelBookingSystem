import express from "express";
import "dotenv/config";
import cors from "cors";
import hotelRoute from "./routes/hotelRoute.js";
import indiaRoute from "./routes/indiaRoute.js";
import worldRoute from "./routes/worldRoute.js";
import propertyRoute from "./routes/propertyRoute.js";
import registerRoute from "./routes/registerRoute.js";
import mongoose from "mongoose";
import { MONGO_URL } from "./config.js";

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://hotel-booking-system-green-delta.vercel.app' ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/hotel', hotelRoute);
app.use("/api/india", indiaRoute);
app.use("/api/world", worldRoute);
app.use("/api/property", propertyRoute);
app.use("/api/register", registerRoute);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: "Hotel Booking API is working!",
    timestamp: new Date().toISOString()
  });
});

// Database connection and server start
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Database Connected Successfully!');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Database connection error:', err);
    process.exit(1);
  });

export default app;
