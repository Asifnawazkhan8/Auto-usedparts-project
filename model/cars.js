const mongoose = require('mongoose');


const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String, required: true },
  vin: String,
  millage: Number,
  totalAmount: Number,
  des: String,
  images: [String], 
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
