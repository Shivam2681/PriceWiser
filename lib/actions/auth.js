"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";

export async function registerUser({ name, email, password }) {
  try {
    await connectToDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    return {
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(error.message || "Failed to register user");
  }
}

export async function getUserByEmail(email) {
  try {
    await connectToDB();
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

export async function getUserById(userId) {
  try {
    await connectToDB();
    const user = await User.findById(userId).lean();
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
