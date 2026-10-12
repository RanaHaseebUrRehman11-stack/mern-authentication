const express = require("express");

const router = express.Router();


const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");


const {
    createServiceRequest,
    getMyRequests,
    getAllServiceRequests,
    assignMechanic,
    updateServiceStatus,
    getServiceHistory
} = require("../controllers/serviceRequestController");



// Create Service Request

router.post(
    "/",
    authMiddleware,
    createServiceRequest
);
router.get(
    "/my-requests",
    authMiddleware,
    getMyRequests
);
router.get(
    "/",
    adminAuth,
    getAllServiceRequests
);
router.put(
    "/:id/assign",
    adminAuth,
    assignMechanic
);
router.put(
    "/:id/status",
    adminAuth,
    updateServiceStatus
);
router.get(
    "/history",
    authMiddleware,
    getServiceHistory
);


module.exports = router;