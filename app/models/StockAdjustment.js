const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const stockAdjustmentSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: Object,
    },
    date: {
      type: String,
    },
    type: {
      type: String,
    },
    reason: {
      type: String,
    },
    description: {
      type: String,
    },
    items: [],
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

stockAdjustmentSchema.plugin(mongoosePaginate)


module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
