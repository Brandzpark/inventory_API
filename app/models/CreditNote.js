const mongoose = require("mongoose");
const { Schema } = mongoose;

const creditNoteSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    customerCode: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    amount: {
      type: String,
    },
    availableAmount: {
      type: String,
    },
    remark: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null
    },
    history: [],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CreditNote", creditNoteSchema);
