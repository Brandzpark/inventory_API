const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseSchema = mongoose.Schema(
  {
    warehouse: {
      type: String,
      default: "Default"
    },
    quantity: {
      type: String,
    }
  },
  { _id: false }
)

const productSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
    },
    department: {
      type: String,
    },
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    remark: {
      type: String,
    },
    price: {
      type: String,
    },
    cost: {
      type: String,
    },
    discount: {
      type: String,
    },
    warehouseQuantity: [warehouseSchema],
    history: [
      {
        event: {
          type: String,
        },
        type: {
          type: String,
        },
        quantity: {
          type: String,
        },
        user: {
          type: Object,
          default: null
        },
        stockAdjustment: {
          type: String,
          default: null
        },
        timestamps: {
          type: Date,
        },
      }
    ],
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
