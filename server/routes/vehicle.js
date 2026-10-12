const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
    registerVehicle,
    getMyVehicles,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");


// ============================
// Vehicle Routes
// ============================

router.post(
    "/",
    authMiddleware,
    registerVehicle
);
router.get(
    "/my-vehicles",
    authMiddleware,
    getMyVehicles
);
router.put(
    "/:id",
    authMiddleware,
    updateVehicle
);
router.delete(
    "/:id",
    authMiddleware,
    deleteVehicle
);

module.exports = router;