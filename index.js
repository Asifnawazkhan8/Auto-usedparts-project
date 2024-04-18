const express = require('express');
const Part = require('./model/part');
const Car = require('./model/cars');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectToMongo = require('./db');
const app = express();
const multer = require('multer');
const cors = require('cors'); 
const corsOptions = {
  origin: 'https://www.qasralhasna.ae',
  methods: 'GET, POST, PUT, DELETE',
};
app.use(cors(corsOptions));

const partsstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/parts');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const partsupload = multer({
  storage: partsstorage,
  fileFilter: (req, file, cb) => {
    if (['url1', 'url2', 'url3', 'url4'].includes(file.fieldname)) {
      const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb('Error: Invalid file extension. Only JPEG, JPG, PNG, and GIF files are allowed.');
      }
    } else {
      cb('Error: Unexpected field');
    }
  },
});

const carsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cars');
  },
  filename: function (req, file, cb) {
    cb(null,Date.now() + file.originalname);
  },
});


const carsUpload = multer({
  storage: carsStorage,
  fileFilter: (req, file, cb) => {
    const uploadedImages = req.files || [];
    console.log("Uploaded images count:", uploadedImages.length);
    cb(null, true); // Allow any number of images without condition
  },
}).array('images[]');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
connectToMongo();

// Serve static files from 'uploads/cars'
app.use('/uploads/cars', express.static(path.join(__dirname, 'uploads/cars')));
// Serve static images for the 'car-details' page
app.use('/car-details', express.static(path.join(__dirname, 'uploads/cars')));
app.use('/all-products', express.static(path.join(__dirname, 'uploads/parts')));


// Your other routes
app.use('/car-details', require('./routes/car-details'));
app.use('/product-details', require('./routes/product-details'));
app.use('/', require('./routes/index'));
app.use('/log-in', require('./routes/login'));
app.use('/about-us', require('./routes/about'));
app.use('/contact-us', require('./routes/contact'));
app.use('/all-products', require('./routes/all-products'));
app.use('/search', require('./routes/search'));
app.use('/category/:category', require('./routes/categories'));
app.use('/vehicle/:vehicle', require('./routes/vehicles'));
app.use('/view-cart', require('./routes/viewCart'));

async function fetchCarImages() {
  try {
    const cars = await Car.find().lean();
    return cars;
  } catch (error) {
    throw error;
  }
}

app.use('/cars', async (req, res, next) => {
  try {
    const cars = await fetchCarImages();
    if (!cars || cars.length === 0) {
      console.log('No cars found.');
      return res.status(404).send('No cars found.');
    }

    res.locals.cars = cars;

    // Build the resolved path using path.join
    const resolvedPath = path.join(__dirname, 'uploads', 'cars', req.path.replace('/uploads', ''));

    console.log('Requested URL:', req.originalUrl);
    console.log('Resolved Path:', resolvedPath);

    next();
  } catch (error) {
    console.error('Error fetching car images:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/cars', (req, res) => {
  res.render('cars', { cars: res.locals.cars });
});


// const carsData = [
//   { model: 'Car1', color: 'Red', totalAmount: 20000 },
//   { model: 'Car2', color: 'Blue', totalAmount: 25000 },
//   // ... other cars
// ];

// app.get('/cars', (req, res) => {
//   res.render('cars', { cars: carsData });
// });


// Second route handler for paginated /cars request
const ITEMS_PER_PAGE = 15;

app.get('/cars/pagginated', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const totalCars = await Car.aggregate([{ $group: { _id: null, count: { $sum: 1 } } }]);
    const totalPages = Math.ceil(totalCars[0].count / ITEMS_PER_PAGE);

    console.log('Current Page:', page);
    console.log('Total Cars:', totalCars[0].count);
    console.log('Total Pages:', totalPages);

    const cars = await fetchCarsFromDatabase(page, ITEMS_PER_PAGE);

    res.render('cars', { cars, currentPage: parseInt(page), totalPages });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function fetchCarsFromDatabase(page, itemsPerPage) {
  const skip = (page - 1) * itemsPerPage;
  const cars = await Car.find().skip(skip).limit(itemsPerPage);
  return cars;
}


// app.get('/car', async (req, res) => {
//   try {
//     const model = req.params.model;
//     console.log('Requested model:', model);

//     const cars = await fetchCarsByModel(model);
//     console.log('Fetched cars:', cars);

//     if (!cars || cars.length === 0) {
//       console.log('No cars found');
//       return res.status(404).send('No cars found');
//     }

//     console.log('Rendering car-details page with cars:', cars);
//     res.render('car-details', { cars });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });




app.get('/addCars', (req, res) => {
  res.render('addCars');
});


// Handle requests for adding a product
app.get('/addProduct', (req, res) => {
  res.render('addProduct');
});

// Handle the POST request for adding a product
app.post('/addProduct', partsupload.fields([
  { name: 'url1', maxCount: 1 },
  { name: 'url2', maxCount: 1 },
  { name: 'url3', maxCount: 1 },
  { name: 'url4', maxCount: 1 },
]), async (req, res) => {
  console.log('Add product route reached');
  console.log('Form Data:', req.body);
  try {
    const newPart = new Part({
      name: req.body.name || "",
      alias: req.body.alias || "",
      gname: req.body.gname || "",
      totalAmount: Number(req.body.totalAmount) || 0,
      qty: Number(req.body.qty) || 0,
      rate: Number(req.body.rate) || 0,
      salePrice: Number(req.body.salePrice) || 0,
      code: req.body.code || "",
      partsCode: req.body.partsCode || "",
      count: Number(req.body.count) || 0,
      url1: req.files['url1'] ? req.files['url1'][0].path : "",
      url2: req.files['url2'] ? req.files['url2'][0].path : "",
      url3: req.files['url3'] ? req.files['url3'][0].path : "",
      url4: req.files['url4'] ? req.files['url4'][0].path : "",
    });

    const savedProduct = await newPart.save();
    console.log('Product added successfully:', savedProduct);
    res.redirect('/addProduct');
  } catch (error) {
    console.error('Error adding product:', error);
    res.render('error', { error });
  }
});

// Handle the POST request for adding a car
app.post('/addCars', carsUpload, async (req, res) =>  {
  console.log('Add car route reached');
  console.log('Form Data:', req.body);

  const images = req.files;
  if (images.length < 4 || images.length > 15) {
    return res.status(400).json({ error: 'Invalid number of images. Minimum 4 and maximum 15 images are allowed.' });
  }

  const normalizedImages = req.files.map(file => file.path.replace(/\\/g, '/'));

  const newCar = new Car({
    model: req.body.model || "",
    year: Number(req.body.year) || 0,
    color: req.body.color || "",
    vin: req.body.vin || "",
    millage: Number(req.body.millage) || 0,
    totalAmount: Number(req.body.totalAmount) || 0,
    des: req.body.des || "",
    images: normalizedImages,
  });

  try {
    const savedCar = await newCar.save();
    console.log('Car added successfully:', savedCar);
    res.redirect('/addCars');
  } catch (error) {
    console.error('Error adding car:', error);
    res.render('error', { error });
  }
});


app.get('/notfound', (req, res) => {
  res.render('notfound', { partsArray });
});

// Handle other routes

app.get('/login', (req, res) => {
  res.render('login');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('Website is running on port 3000');
});
