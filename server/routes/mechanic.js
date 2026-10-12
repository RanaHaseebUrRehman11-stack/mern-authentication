const express = require("express");

const router = express.Router();

const mechanicAuth = require("../middleware/mechanicAuth");

const {
    getMechanicStats,
    getMyJobs,
    getMyJob,
    updateMyJobStatus,
    getMyProfile,
    updateMyProfile
} = require("../controllers/mechanicPortalController");

// Every route here is scoped to the authenticated mechanic's linked record.

router.get("/dashboard", mechanicAuth, getMechanicStats);

router.get("/jobs", mechanicAuth, getMyJobs);

router.get("/jobs/:id", mechanicAuth, getMyJob);

router.put("/jobs/:id/status", mechanicAuth, updateMyJobStatus);

router.get("/profile", mechanicAuth, getMyProfile);

router.put("/profile", mechanicAuth, updateMyProfile);

module.exports = router;
