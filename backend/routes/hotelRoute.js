import express from "express";
import { 
  addHotel, 
  getHotel, 
  getSingleHotel, 
  updateHotel, 
  deleteHotel 
} from "../controllers/useControllers.js"; 

const router = express.Router();

router.post('/', addHotel);
router.get('/all', getHotel);
router.get('/:id', getSingleHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

export default router;