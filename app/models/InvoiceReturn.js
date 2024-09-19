const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemsSchema = mongoose.Schema(
  {
    code: {
      type: String,
    },
    name: {
      type: String,
    },
    remark: {
      type: String,
    },
    quantity: {
      type: String,
      default: "1",
    },
    rate: {
      type: String,
      default: "0",
    },
    isDamaged: {
      type: Boolean,
      default: false
    },
    subTotal: {
      type: String,
    },
    total: {
      type: String,
    },
  },
  { _id: false }
);

const invoiceReturnSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    invoiceCode: {
      type: String,
    },
    date: {
      type: Date,
    },
    remark: {
      type: String,
    },
    items: [itemsSchema],
    deletedAt: {
      type: Date,
      default: null
    },
    subTotal: {
      type: String,
    },
    total: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InvoiceReturn", invoiceReturnSchema);
