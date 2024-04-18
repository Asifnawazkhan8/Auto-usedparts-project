const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: String,
  alias: String,
  gname: String,
  totalAmount: Number,
  qty: Number,
  rate: Number,
  salePrice: Number,
  code: String,
  partsCode: String,
  count: Number,
  url1: {
    type: String,
    set: function (url) {
      // Replace backslashes with forward slashes
      return url.replace(/\\/g, '/');
    },
  },
  url2: {
    type: String,
    set: function (url) {
      // Replace backslashes with forward slashes
      return url.replace(/\\/g, '/');
    },
  },
  url3: {
    type: String,
    set: function (url) {
      // Replace backslashes with forward slashes
      return url.replace(/\\/g, '/');
    },
  },
  url4: {
    type: String,
    set: function (url) {
      // Replace backslashes with forward slashes
      return url.replace(/\\/g, '/');
    },
  },
});

const Part = mongoose.model('Part', partSchema, 'parts');

module.exports = Part;
