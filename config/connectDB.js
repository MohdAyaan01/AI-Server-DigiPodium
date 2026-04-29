import mongoose from "mongoose";

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully ...");
    } catch (err) {
        console.log("Database Connection Failed",err);
        process.exit(1);
    }}
export default connectDB;