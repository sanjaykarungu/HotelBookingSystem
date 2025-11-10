import express from "express";
import { 
  registerProfile, 
  getRegisteredProfile,
  getSingleRegisteredProfile,
  updateRegisteredProfile, 
  deleteRegisteredProfile,
  loginProfile,
  getCurrentProfile,
  protect
} from "../controllers/registerControllers.js"; 

const router = express.Router();

// Public routes
router.post('/', registerProfile);
router.post('/login', loginProfile);

// Protected routes
router.get('/all', protect, getRegisteredProfile);
router.get('/profile', protect, getCurrentProfile);
router.get('/:id', protect, getSingleRegisteredProfile);
router.put('/:id', protect, updateRegisteredProfile);
router.delete('/:id', protect, deleteRegisteredProfile);

export default router;