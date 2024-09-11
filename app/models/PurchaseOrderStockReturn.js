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
        subTotal: {
            type: String,
        },
        total: {
            type: String,
        },
    },
    { _id: false }
);

const purchaseOrderStockReturnSchema = new Schema({
    code: {
        type: String,
        trim: true,
        unique: true,
    },
    date: {
        type: Date,
    },
    purchaseOrderCode: {
        type: String,
    },
    remark: {
        type: String,
    },
    subTotal: {
        type: String,
    },
    total: {
        type: String,
    },
    items: [itemsSchema],
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model("purchaseOrderStockReturn", purchaseOrderStockReturnSchema);
