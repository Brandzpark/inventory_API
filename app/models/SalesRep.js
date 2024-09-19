const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const salesRepSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    salutation: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    nic: {
      type: String,
    },
    taxNo: {
      type: String,
    },
    customers: [],
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

salesRepSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("SalesRep", salesRepSchema);
