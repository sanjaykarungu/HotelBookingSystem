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
const propertySchema = mongoose.Schema(  // Changed this variable name
    {
        type: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image_url: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    
        // Arrays for hotels in each country
        luxury_hotel: [hotelSchema],
        beach_resort: [hotelSchema],
        mountain_cabin: [hotelSchema],
        city_apartment: [hotelSchema],
        boutique_hotel: [hotelSchema],
        home_stay: [hotelSchema],
        treehouse_resort: [hotelSchema],
        hostel: [hotelSchema],
        cottage: [hotelSchema],  // Fixed typo: germnany → germany
        houseboat: [hotelSchema]
    }
);

// FIXED: Using the correct schema variable name
const Property = mongoose.model('Property', propertySchema);
export default Property;