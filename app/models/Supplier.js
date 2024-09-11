const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierSchema = new Schema(
    {
        code: {
            type: String,
            trim: true,
            unique: true,
        },
        salutation: {
            type: String,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        address: {
            type: String,
        },
        nic: {
            type: String,
        },
        taxNo: {
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

module.exports = mongoose.model("Supplier", supplierSchema);
