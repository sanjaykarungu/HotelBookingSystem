import express from 'express';
import {
  addProperty,
  getProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyControllers.js';

const router = express.Router();

// Routes for properties
router.post('/', addProperty); // Add a new property
router.get('/all', getProperties); // Get all properties
router.get('/:id', getSingleProperty); // Get single property by ID
router.put('/:id', updateProperty); // Update a property
router.delete('/:id', deleteProperty); // Delete a property

export default router;