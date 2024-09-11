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
    discount: {
      type: String,
      default: "0",
    },
    discountAmount: {
      type: String,
    },
    type: {
      type: String,
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

const invoiceSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    date: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    isFreeIssue: {
      type: Boolean,
      default: false,
    },
    customerNote: {
      type: String,
    },
    customerCode: {
      type: String,
    },
    salesRepCode: {
      type: String,
    },
    items: [itemsSchema],
    remark: {
      type: String,
    },
    totalDiscount: {
      type: String,
    },
    subTotal: {
      type: String,
    },
    tax: {
      type: String,
    },
    taxAmount: {
      type: String,
    },
    total: {
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

module.exports = mongoose.model("Invoice", invoiceSchema);
