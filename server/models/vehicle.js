const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(

    {

        owner: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        vehicleNumber: {

            type: String,

            required: true,

            unique: true,

            trim: true

        },

        company: {

            type: String,

            required: true,

            trim: true

        },

        model: {

            type: String,

            required: true,

            trim: true

        },

        year: {

            type: Number,

            required: true

        },

        color: {

            type: String,

            required: true,

            trim: true

        },

        vehicleType: {

            type: String,

            enum: ["Car", "Bike", "Van", "Truck"],

            default: "Car"

        }

    },

    {

        timestamps: true

    }

);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;