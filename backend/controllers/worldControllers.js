import World from "../models/worldModel.js"

export const addCountry = async(req,res)=>{
  try{
    if(!req.body.country || !req.body.image_url || !req.body.description || !req.body.capital || !req.body.annual_tourists){
      res.status(400).send({
          message:'send all required fields: country, image_url, description, capital, annual_tourists!'
    })
  }
    const newCountry = {
      country: req.body.country,
      image_url: req.body.image_url,
      description: req.body.description,
      capital: req.body.capital,
      annual_tourists: req.body.annual_tourists,
      france: req.body.france || [],
      spain: req.body.spain || [],
      united_states: req.body.united_states || [],
      china: req.body.china || [],
      italy: req.body.italy || [],
      turkey: req.body.turkey || [],
      mexico: req.body.mexico || [],
      thailand: req.body.thailand || [],
      germany: req.body.germany || [],  // Fixed typo
      united_kingdom: req.body.united_kingdom || []
    }

    const country = await World.create(newCountry)
    res.status(201).send(country)
  
  }catch(err){
    console.log(err.message)
    res.status(500).send({message:err.message})
  }
}

export const getCountries = async (req,res)=>{
   try{
    const countries = await World.find({});
    res.status(200).json({
      count:countries.length,
      data:countries
    })
   }
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const getSingleCountry = async (req,res)=>{
   try{
        const {id} = req.params
        console.log(id)
        const singleCountry = await World.findById(id)
        if(!singleCountry){
          return res.status(404).json({message:"Country not found"})
        }
        res.status(200).json(singleCountry)
        
    }
   
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const updateCountry = async (req,res)=>{
  try{
    const {id} =req.params;
    const updateCountry = await World.findByIdAndUpdate(id,req.body)
    if(!updateCountry){
      res.status(404).json({message:"Country not found"})
    }
    else{
      res.status(200).json({message:"Country updated successfully"})
    }
  }
  catch(err){
    res.status(500).send({message:err.message})
  }
}

export const deleteCountry = async(req,res)=>{
  try{
    const {id} = req.params;
    const deleteCountry = await World.findByIdAndDelete(id)
    if(!deleteCountry){
      res.status(404).json({message:"Country not found"})
    }
    else{
      res.status(200).json({message:"Country deleted successfully"})
    }
  }
  catch(err){
    res.status(500).send({message:err.message})
  }
}