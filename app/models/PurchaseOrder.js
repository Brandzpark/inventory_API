const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

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
    subTotal: {
      type: String,
    },
    total: {
      type: String,
    },
  },
  { _id: false }
);

const historySchema = mongoose.Schema(
  {
    event: {
      type: String,
    },
    user: {
      type: Object,
      default: null,
    },
    timestamps: {
      type: Date,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    orderDate: {
      type: Date,
    },
    requiredDate: {
      type: String,
    },
    remark: {
      type: String,
    },
    supplier: {
      _id: {
        type: String,
      },
      code: {
        type: String,
      },
    },
    items: [itemsSchema],
    totalDiscount: {
      type: String,
    },
    subTotal: {
      type: String,
    },
    total: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
