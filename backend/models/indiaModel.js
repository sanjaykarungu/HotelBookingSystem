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

// Main India state schema
const indiaSchema = mongoose.Schema(
    {
        state: {
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
        
        // Arrays for hotels in each state
        goa: [hotelSchema],
        tamilnadu: [hotelSchema],
        kerala: [hotelSchema],
        himachalpradesh: [hotelSchema],
        rajasthan: [hotelSchema],
        uttarakhand: [hotelSchema],
        maharashtra: [hotelSchema],
        karnataka: [hotelSchema],
        gujarat: [hotelSchema],
        westbengal: [hotelSchema]
    }
);

const India = mongoose.model('India', indiaSchema);
export default India;