import { OAuth2Client } from "google-auth-library";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google Token Missing",
        success: false
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        message: "Invalid Google Token",
        success: false
      });
    }

    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Email not found",
        success: false
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0] || "User",
        email,
        password: "google-auth"
      });
    }

    const tokenData = {
      userId: user._id
    };

    const jwtToken = jwt.sign(
      tokenData,
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res
      .status(200)
      .cookie("token", jwtToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000

      })
      .json({
        message: "Google Login Successfully",
        success: true,
        user: userWithoutPassword,
        token: jwtToken
      });

  } catch (error) {
    console.error("Google Auth Error", error.message);
    return res.status(500).json({
      message: "Google Authentication Failed",
      success: false
    });
  }
};