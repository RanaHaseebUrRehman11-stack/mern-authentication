const mongoose = require("mongoose");
const { SERVICE_STATUS_VALUES } = require("./serviceStatus");


const serviceRequestSchema = new mongoose.Schema(

    {


        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        vehicle: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Vehicle",

            required: true

        },


        mechanic: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Mechanic",

            default: null

        },


        serviceType: {

            type: String,

            required: true,

            trim: true

        },


        description: {

            type: String,

            required: true,

            trim: true

        },


        images: [

            {

                type: String

            }

        ],


        status: {

            type: String,

            enum: SERVICE_STATUS_VALUES,

            default: "Pending"

        },


        assignedAt: {

            type: Date,

            default: null

        },


        completedAt: {

            type: Date,

            default: null

        }


    },


    {

        timestamps: true

    }

);



serviceRequestSchema.index({ user: 1, status: 1 });
serviceRequestSchema.index({ mechanic: 1, status: 1 });

const ServiceRequest = mongoose.model(

    "ServiceRequest",

    serviceRequestSchema

);



module.exports = ServiceRequest;