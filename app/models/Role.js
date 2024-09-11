const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
        },
        permissions: [],
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Role", roleSchema);
