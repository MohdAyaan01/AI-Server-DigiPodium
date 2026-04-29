import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Portfolio } from "../models/portfolioModel.js";


export const SignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All Fields Are Required", success: false });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User Already Exist...", success: false });

    const saltRounds = Number(process.env.SALT) || 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      password: hashPassword
    })

    // Remove password before sending
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    return res.status(200).json({
      message: "Account Created SuccessFully...",
      success: true,
      user: userWithoutPassword
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
}

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All Fields Are Required...",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email And Password...",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect Email And Password...",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(
      tokenData,
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Remove password from user object
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none", // Changed from strict for better dev compatibility
        secure: true
      })
      .json({
        message: `${user.name} Login Successfully...`,
        success: true,
        user: userWithoutPassword,
        token: token
      });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const Logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged Out SuccessFully"
    })
  } catch (err) {
    console.log(err);
  }
}

export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Searching history for ID:", userId);
    const portfolios = await Portfolio.find({ userId });

    res.status(200).json(portfolios);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ message: "Error Fetching History" })
  }
}
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
