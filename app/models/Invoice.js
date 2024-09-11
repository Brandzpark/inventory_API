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
    customerCode: {
      type: String,
    },
    address: {
      type: String,
    },
    salesRepCode: {
      type: String,
    },
    type: {
      type: String,
    },
    customerRemark: {
      type: String,
    },
    customerRemarkFreeItems: {
      type: String,
    },
    hasFreeIssueItems: {
      type: Boolean,
      default: false,
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
    items: [itemsSchema],
    deletedAt: {
      type: Date,
      default: null
    },
    remainingAmount: {
      type: String,
    },
    status: {
      type: String,
      default: "pending"
    },
    history: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
