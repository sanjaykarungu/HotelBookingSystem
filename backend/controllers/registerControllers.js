import { registerModel } from "../models/registerModel.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
};

export const registerProfile = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    if (!req.body) {
      return res.status(400).send({
        message: 'Request body is missing!'
      });
    }

    const { name, gmail, number, password, confirm_password } = req.body;

    // Check for required fields
    if (!name || !gmail || !password || !confirm_password) {
      return res.status(400).send({
        message: 'Send all required fields: name, gmail, password, and confirm_password!'
      });
    }

    // Check if passwords match
    if (password !== confirm_password) {
      return res.status(400).send({
        message: 'Password and confirm password do not match!'
      });
    }

    // Check if user already exists
    const existingUser = await registerModel.findOne({ gmail });
    if (existingUser) {
      return res.status(400).send({
        message: 'User with this email already exists!'
      });
    }

    const newProfile = {
      name,
      gmail,
      number: number || "",
      password, // Password will be hashed by the model pre-save hook
    };

    const profile = await registerModel.create(newProfile);
    
    // Generate JWT token
    const token = generateToken(profile._id);

    return res.status(201).json({
      message: "Profile registered successfully",
      data: {
        _id: profile._id,
        name: profile.name,
        gmail: profile.gmail,
        number: profile.number
      },
      token
    });
  
  } catch (err) {
    console.log("Error:", err.message);
    
    if (err.code === 11000) {
      return res.status(400).send({ 
        message: 'User with this email already exists!' 
      });
    }
    
    return res.status(500).send({ 
      message: 'Server error: ' + err.message 
    });
  }
}

// Login controller
export const loginProfile = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    // Check for required fields
    if (!gmail || !password) {
      return res.status(400).send({
        message: 'Please provide email and password!'
      });
    }

    // Find user and select password field explicitly
    const user = await registerModel.findOne({ gmail }).select('+password');
    if (!user) {
      return res.status(401).send({
        message: 'Invalid email or password!'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send({
        message: 'Invalid email or password!'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        gmail: user.gmail,
        number: user.number
      },
      token
    });

  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).send({ 
      message: 'Server error: ' + err.message 
    });
  }
}

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from token
    const user = await registerModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        message: 'Not authorized, user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized, token failed'
    });
  }
}

export const getRegisteredProfile = async (req, res) => {
  try {
    const profiles = await registerModel.find({}).select('-password');
    return res.status(200).json({
      count: profiles.length,
      data: profiles
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const getSingleRegisteredProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const singleProfile = await registerModel.findById(id).select('-password');
    
    if (!singleProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    return res.status(200).json(singleProfile);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const updateRegisteredProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, handle it properly
    if (updateData.password) {
      if (!updateData.confirm_password || updateData.password !== updateData.confirm_password) {
        return res.status(400).send({
          message: 'Password and confirm password do not match!'
        });
      }
      // Remove confirm_password as it's not in the schema
      delete updateData.confirm_password;
    } else {
      // Remove password fields if not updating password
      delete updateData.password;
      delete updateData.confirm_password;
    }

    const updatedProfile = await registerModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    return res.status(200).json({ 
      message: "Profile updated successfully", 
      data: updatedProfile
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const deleteRegisteredProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProfile = await registerModel.findByIdAndDelete(id);
    
    if (!deletedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    return res.status(200).json({ message: "Profile registration deleted successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

// Get current user profile
export const getCurrentProfile = async (req, res) => {
  try {
    const user = await registerModel.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}