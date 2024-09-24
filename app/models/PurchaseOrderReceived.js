const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const purchaseOrderReceivedSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    purchaseOrderCode: {
      type: String,
    },
    receivedDate: {
      type: Date,
    },
    remark: {
      type: String,
    },
    totalDiscount: {
      type: String,
      default: "0",
    },
    subTotal: {
      type: String,
      default: "0",
    },
    total: {
      type: String,
      default: "0",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    items: [
      {
        code: {
          type: String,
        },
        name: {
          type: String,
        },
        rate: {
          type: String,
        },
        orderedQuantity: {
          type: String,
        },
        receivedQuantity: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
purchaseOrderReceivedSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PurchaseOrderReceived", purchaseOrderReceivedSchema);
