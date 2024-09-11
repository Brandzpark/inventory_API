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
      type: Schema.Types.Mixed,
      default: null,
      set: function (value) {
        return value === undefined || value === null ? null : value;
      }
    },
    cheque: {
      type: Schema.Types.Mixed,
      default: null,
      set: function (value) {
        return value === undefined || value === null ? null : value;
      }
    },
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
