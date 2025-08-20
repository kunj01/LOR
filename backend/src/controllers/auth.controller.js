import prisma from "../utils/prismClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
dotenv.config();

const loginUser = async (req, res) => {
  try {
    const { enrollment_no, password } = req.body;
    if (!enrollment_no || !password) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }
    const user = await prisma.user.findFirst({
      where: { id: { equals: enrollment_no, mode: "insensitive" } },
    });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(new ApiError(401, "Invalid credentials"));
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET
    );
    const options = {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.cookie("token", token, options);
    delete user.password;

    return res.status(200).json(new ApiResponse(200, user, "Login success"));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

const restPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Password reset request for user:", userId);
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json(new ApiError(400, "New password is required"));
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json(new ApiError(400, "New password must be at least 6 characters long"));
    }
    
    const user = await prisma.user.findFirst({
      where: { id: { equals: userId, mode: "insensitive" } },
    });
    
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    
    // Verify currentPassword if provided
    if (currentPassword && !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json(new ApiError(401, "Current password is incorrect"));
    }
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    console.log("Password reset successful for user:", userId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password reset success"));
  } catch (err) {
    console.error("Password reset error:", err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

const ping = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findFirst({
      where: { id: { equals: userId, mode: "insensitive" } },
    });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    delete user.password;
    return res.status(200).json(new ApiResponse(200, user, "pong"));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Error", err));
  }
};

const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 0,
    };

    res.clearCookie("token", options);

    return res.status(200).json(new ApiResponse(200, {}, "User logged Out"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json(new ApiError(403, "Access denied. Admin only."));
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      where: {
        role: {
          not: "ADMIN",
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users retrieved successfully"));
  } catch (err) {
    console.log(err);
    return res.status(500).json(new ApiError(500, "Server Error", err));
  }
};

const registerUser = async (req, res) => {
  try {
    const { id, name, email, password, role = "STUDENT" } = req.body;
    
    if (!id || !name || !email || !password) {
      return res.status(400).json(new ApiError(400, "Missing required fields"));
    }
    
    if (password.length < 6) {
      return res.status(400).json(new ApiError(400, "Password must be at least 6 characters long"));
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: { equals: id, mode: "insensitive" } },
          { email: { equals: email, mode: "insensitive" } }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json(new ApiError(409, "User with this ID or email already exists"));
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const user = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: hashedPassword,
        role,

      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,

      }
    });
    
    return res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json(new ApiError(500, "Internal Server Error", err));
  }
};

export { loginUser, registerUser, restPassword, ping, logout, getAllUsers };
