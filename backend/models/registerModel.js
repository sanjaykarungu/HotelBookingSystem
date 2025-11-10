import mongoose from "mongoose";
import bcrypt from "bcrypt";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    gmail: {  
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    number: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
hotelSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
hotelSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const registerModel = mongoose.model("Register", hotelSchema);