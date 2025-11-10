import Property from "../models/propertyModel.js"

export const addProperty = async(req,res)=>{
  try{
    if(!req.body.type || !req.body.name || !req.body.image_url || !req.body.location || !req.body.description){
      res.status(400).send({
          message:'send all required fields: type, name, image_url, location, description!'
    })
  }
    const newProperty = {
      type: req.body.type,
      name: req.body.name,
      image_url: req.body.image_url,
      location: req.body.location,
      description: req.body.description,
      luxury_hotel: req.body.luxury_hotel || [],
      beach_resort: req.body.beach_resort || [],
      mountain_cabin: req.body.mountain_cabin || [],
      city_apartment: req.body.city_apartment || [],
      boutique_hotel: req.body.boutique_hotel || [],
      home_stay: req.body.home_stay || [],
      treehouse_resort: req.body.treehouse_resort || [],
      hostel: req.body.hostel || [],
      cottage: req.body.cottage || [],
      houseboat: req.body.houseboat || []
    }

    const property = await Property.create(newProperty)
    res.status(201).send(property)
  
  }catch(err){
    console.log(err.message)
    res.status(500).send({message:err.message})
  }
}

export const getProperties = async (req,res)=>{
   try{
    const properties = await Property.find({});
    res.status(200).json({
      count:properties.length,
      data:properties
    })
   }
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const getSingleProperty = async (req,res)=>{
   try{
        const {id} = req.params
        console.log(id)
        const singleProperty = await Property.findById(id)
        if(!singleProperty){
          return res.status(404).json({message:"Property not found"})
        }
        res.status(200).json(singleProperty)
        
    }
   
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const updateProperty = async (req,res)=>{
  try{
    const {id} =req.params;
    const updateProperty = await Property.findByIdAndUpdate(id,req.body)
    if(!updateProperty){
      res.status(404).json({message:"Property not found"})
    }
    else{
      res.status(200).json({message:"Property updated successfully"})
    }
  }
  catch(err){
    res.status(500).send({message:err.message})
  }
}

export const deleteProperty = async(req,res)=>{
  try{
    const {id} = req.params;
    const deleteProperty = await Property.findByIdAndDelete(id)
    if(!deleteProperty){
      res.status(404).json({message:"Property not found"})
    }
    else{
      res.status(200).json({message:"Property deleted successfully"})
    }
  }
  catch(err){
    res.status(500).send({message:err.message})
  }
}