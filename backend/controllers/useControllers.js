import { hotelModel } from "../models/hotelModel.js";

export const addHotel = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    if (!req.body) {
      return res.status(400).send({
        message: 'Request body is missing!'
      });
    }

    const { name, image_url, address, country, price, rating, currency, description } = req.body;

    // Check for required fields based on your model
    if (!name || !image_url || !address || !country || !price || !rating || !currency || !description) {
      return res.status(400).send({
        message: 'Send all required fields: name, image_url, address, country, price, rating, description!'
      }); // ✅ Removed 'id' from error message
    }

    const newHotel = {
      name,
      image_url,
      image_url_1: req.body.image_url_1 || "",
      image_url_2: req.body.image_url_2 || "",
      address,
      country,
      price: Number(price),
      rating: Number(rating),
      currency,
      description,
    };

    const hotel = await hotelModel.create(newHotel);
    return res.status(201).json({
      message: "Hotel created successfully",
      data: hotel
    });
  
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).send({ 
      message: 'Server error: ' + err.message 
    });
  }
}

export const getHotel = async (req, res) => {
  try {
    const hotels = await hotelModel.find({});
    return res.status(200).json({
      count: hotels.length,
      data: hotels
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const getSingleHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Use MongoDB's _id instead of custom id field
    const singleHotel = await hotelModel.findById(id);
    
    if (!singleHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    return res.status(200).json(singleHotel);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateHotel = await hotelModel.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updateHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    return res.status(200).json({ 
      message: "Hotel updated successfully", 
      data: updateHotel 
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}

export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteHotel = await hotelModel.findByIdAndDelete(id);
    
    if (!deleteHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    return res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}