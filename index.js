import "dotenv/config";
import express from "express";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import paymentRoutes  from "./routes/razorpayRoutes.js";
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ai-server/index.js
const frontendUrl = process.env.FRONTEND_URL || process.env.FRONTEND_URI || "http://localhost:3000";
console.log("CORS Origin set to:", frontendUrl);

app.use(cors({
    origin: frontendUrl,
    credentials: true 
}));



app.use("/api/auth/user", userRoutes);
app.use("/api/portfolio",portfolioRoutes);
app.use("/api/payment",paymentRoutes)
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server Running At PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
