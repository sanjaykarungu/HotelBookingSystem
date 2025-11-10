import express from 'express';
import {
  addCountry,
  getCountries,
  getSingleCountry,
  updateCountry,
  deleteCountry
} from '../controllers/worldControllers.js';

const router = express.Router();

// Routes for countries
router.post('/', addCountry); // Add a new country
router.get('/all', getCountries); // Get all countries
router.get('/:id', getSingleCountry); // Get single country by ID
router.put('/:id', updateCountry); // Update a country
router.delete('/:id', deleteCountry); // Delete a country

export default router;