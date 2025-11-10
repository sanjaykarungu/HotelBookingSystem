import mongoose from "mongoose";

// Hotel schema for individual hotels
const hotelSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        image_url: {
            type: String,
            default: ""
        },
        image_url_1: {
            type: String,
            default: ""
        },
        image_url_2: {
            type: String,
            default: ""
        },
        price: {
            type: Number,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }
);

// Main World schema (FIXED: changed from indiaSchema to worldSchema)
const worldSchema = mongoose.Schema(  // Changed this variable name
    {
        country: {
            type: String,
            required: true
        },
        image_url: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        capital: {
            type: String,
            required: true
        },
        annual_tourists: {
            type: String,
            required: true
        },

        // Arrays for hotels in each country
        france: [hotelSchema],
        spain: [hotelSchema],
        united_states: [hotelSchema],
        china: [hotelSchema],
        italy: [hotelSchema],
        turkey: [hotelSchema],
        mexico: [hotelSchema],
        thailand: [hotelSchema],
        germany: [hotelSchema],  // Fixed typo: germnany → germany
        united_kingdom: [hotelSchema]
    }
);

// FIXED: Using the correct schema variable name
const World = mongoose.model('World', worldSchema);
export default World;