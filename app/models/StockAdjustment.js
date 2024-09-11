const mongoose = require("mongoose");
const { Schema } = mongoose;

const stockAdjustmentSchema = new Schema(
    {
        createdBy: {
            type: Object,
        },
        date: {
            type: String,
        },
        reason: {
            type: String,
        },
        description: {
            type: String,
        },
        items: [],
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
