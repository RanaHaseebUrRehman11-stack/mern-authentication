const express = require("express");

const router = express.Router();


const adminAuth = require("../middleware/adminAuth");



const {

    getDashboardStats,

    getAllUsers,

    deleteUser

} = require("../controllers/adminController");



const {

    createMechanic,
    createMechanicAccount,
    getAllMechanics,
    updateMechanic,
    updateMechanicApproval,
    deleteMechanic

} = require("../controllers/mechanicController");





// ======================
// Dashboard Stats
// ======================

router.get(

    "/dashboard",

    adminAuth,

    getDashboardStats

);





// ======================
// User Management
// ======================


router.get(

    "/users",

    adminAuth,

    getAllUsers

);



router.delete(

    "/users/:id",

    adminAuth,

    deleteUser

);





// ======================
// Mechanic Management
// ======================


router.post(

    "/mechanics",

    adminAuth,

    createMechanic

);
router.get(
    "/mechanics",
    adminAuth,
    getAllMechanics
);
router.post(
    "/mechanics/:id/account",
    adminAuth,
    createMechanicAccount
);
router.put(
    "/mechanics/:id/approval",
    adminAuth,
    updateMechanicApproval
);
router.put(
    "/mechanics/:id",
    adminAuth,
    updateMechanic
);
router.delete(
    "/mechanics/:id",
    adminAuth,
    deleteMechanic
);





module.exports = router;