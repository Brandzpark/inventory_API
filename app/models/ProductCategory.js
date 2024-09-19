const mongoose = require("mongoose");
const { Schema } = mongoose;

const productCategorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
  },
  deletedAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model("ProductCategory", productCategorySchema);