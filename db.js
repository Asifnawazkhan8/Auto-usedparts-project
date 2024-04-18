

const mongoose = require("mongoose");
const Part = require('./model/part');
const mongoURI = 'mongodb://qasralhasna:Newparts%40123@ac-vq9hcza-shard-00-00.tncit87.mongodb.net:27017,ac-vq9hcza-shard-00-01.tncit87.mongodb.net:27017,ac-vq9hcza-shard-00-02.tncit87.mongodb.net:27017/qasralhasna?ssl=true&replicaSet=atlas-thim5u-shard-0&authSource=admin&retryWrites=true&w=majority';



const connectToMongo = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');


    await initialize();
    console.log('Initialization complete');
    

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Handle any errors that occur during MongoDB connection or initialization
  }
};

async function initialize() {
  let partsCount = {};
  let vehiclesCount = {};

  try {
    const parts = await Part.find().exec();
    for (let i = 0; i < parts.length; i++) {
      const partsCode = parts[i].partsCode;
      const vehicleCode = parts[i].code.slice(0, 5);
      if (!partsCount[partsCode]) {
        partsCount[partsCode] = 1;
      } else {
        partsCount[partsCode]++;
      }
      if (!vehiclesCount[vehicleCode]) {
        vehiclesCount[vehicleCode] = 1;
      } else {
        vehiclesCount[vehicleCode]++;
      }
    }
    global.partsCount = partsCount;
    global.vehiclesCount = vehiclesCount;
    global.parts = parts;
  } catch (error) {
    console.error('Error initializing:', error);
    
  }
}



module.exports = connectToMongo;
