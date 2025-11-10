import India from "../models/indiaModel.js"

export const addState = async(req,res)=>{
  try{
    if(!req.body.state || !req.body.image_url || !req.body.description){
      res.status(400).send({
          message:'send all required fields: state, image_url, description!'
    })
  }
    const newState = {
     
      state: req.body.state,
      image_url: req.body.image_url,
      description: req.body.description,
      goa: req.body.goa || [],
      tamilnadu: req.body.tamilnadu || [],
      kerala: req.body.kerala || [],
      himachalpradesh: req.body.himachalpradesh || [],
      rajasthan: req.body.rajasthan || [],
      uttarakhand: req.body.uttarakhand || [],
      maharashtra: req.body.maharashtra || [],
      karnataka: req.body.karnataka || [],
      gujarat: req.body.gujarat || [],
      westbengal: req.body.westbengal || []
    }

    const states = await India.create(newState)
    res.status(201).send(states)
  
  }catch(err){
    console.log(err.message)
    res.status(500).send({message:err.message})
  }
}

export const getStates = async (req,res)=>{
   try{
    const states = await India.find({});
    res.status(201).json({
      count:states.length,
      data:states
    })
   }
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const getSingleState = async (req,res)=>{
   try{
        const {id} = req.params
        console.log(id)
        const singleState = await India.findById(id)
        res.status(201).json(singleState)
        
    }
   
   catch(err){
    res.status(500).send({message:err.message})
   }
}

export const updateState = async (req,res)=>{

  try{
    const {id} =req.params;
    const updateState = await India.findByIdAndUpdate(id,req.body)
    if(!updateState){
      res.status(404).json({message:"State not found"})
    }
    else{
      res.status(201).json({message:"State updated successfully"})
    }
  }
  catch(err){
    res.status(500).send({message:err.message})
  }
}

export const deleteState = async(req,res)=>{
  try{
    const {id} = req.params;
    const deleteState = await India.findByIdAndDelete(id, req.body)
    if(!deleteState){
      res.status(404).json({message:"State not found"})
    }
    else{
      res.status(201).json({message:"State delete successfully"})
    }
  }
  catch(err){
    res.status(404).send({message:err.message})
  }
}