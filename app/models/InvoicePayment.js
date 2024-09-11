const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoicePaymentSchema = new Schema(
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
    amount: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    bank: {
      name: {
        type: String,
      },
      branch: {
        type: String,
      },
      date: {
        type: Date,
      }
    },
    default: null,
    cheque: {
      number: {
        type: String,
      },
      date: {
        type: Date,
      }
    },
    default: null,
    remark: {
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

module.exports = mongoose.model("InvoicePayment", invoicePaymentSchema);
