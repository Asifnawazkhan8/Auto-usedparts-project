// Import necessary modules
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const Car = require('../model/cars');

// CSRF protection
const csrfProtection = csrf({
  cookie: true,
  secure: true,
  httpOnly: true,
});

// Define the route for displaying car details
router.get('/:model', csrfProtection, async (req, res) => {
  try {
    // Extract the model from the URL parameters
    const model = req.params.model;

    console.log('Requested Car Model:', model);

    // Find the car in the database based on the model
    const car = await Car.findOne({ model });

    // If the car is not found, return a 404 response
    if (!car) {
      console.log('Car not found:', model);
      return res.status(404).send('Car not found');
    }

    console.log('Car found:', car);

    // Fetch related cars based on the model (limit to 4 for example)
    const relatedCars = await Car.find({ model }).limit(4);

    console.log('Related Cars:', relatedCars);

    // Define base URL for related cars
    const baseUrl = '/cars';

    // Define URL for the current page
    const url = `/car-details/${encodeURIComponent(model)}`;

    // Render the 'car-details' view with the necessary data
    res.status(200).render('car-details', {
      csrfToken: req.csrfToken(),
      car,
      url,
      baseUrl,
      relatedCars,
    });
  } catch (error) {
    console.error('Error fetching car details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Export the router for use in the main application
module.exports = router;
