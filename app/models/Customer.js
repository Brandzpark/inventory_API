const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const customerSchema = new Schema(
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
      trim: true,
    },
    email: {
      type: String,
    },
    nic: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    address: {
      type: String,
      default: "active"
    },
    taxNo: {
      type: String,
    },
    status: {
      type: String,
    },
    openingBalance: {
      type: String,
    },
    creditLimit: {
      type: String,
    },
    creditPeriod: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

customerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Customer", customerSchema);
