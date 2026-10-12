const {
    app,
    request,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Mechanic = require("../models/mechanic");
const ServiceRequest = require("../models/serviceRequest");

describe("Admin", () => {
    test("blocks non-admin users from admin routes", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .get("/api/admin/users")
            .set(authHeader(token));

        expect(response.status).toBe(403);
    });

    test("blocks unauthenticated access", async () => {
        const response = await request(app).get("/api/admin/users");

        expect(response.status).toBe(401);
    });

    describe("GET /api/admin/dashboard", () => {
        test("returns aggregate statistics from real data", async () => {
            const userToken = await createAndLogin();
            const adminToken = await createAdminAndLogin();

            const user = await User.findOne({ email: "user@example.com" });

            await Vehicle.create({
                owner: user._id,
                vehicleNumber: "ABC-123",
                company: "Toyota",
                model: "Corolla",
                year: 2020,
                color: "White"
            });

            await Mechanic.create({
                name: "Mech One",
                email: "mech@example.com",
                phone: "1234567890",
                specialization: "Engine",
                experience: 5
            });

            await ServiceRequest.create({
                user: user._id,
                vehicle: (await Vehicle.findOne())._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

            await request(app)
                .get("/api/vehicles/my-vehicles")
                .set(authHeader(userToken));

            const response = await request(app)
                .get("/api/admin/dashboard")
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);
            expect(response.body.totalUsers).toBe(1);
            expect(response.body.totalVehicles).toBe(1);
            expect(response.body.totalMechanics).toBe(1);
            expect(response.body.totalRequests).toBe(1);
            expect(response.body.pendingRequests).toBe(1);
            expect(response.body.completedRequests).toBe(0);
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        test("soft-deletes a normal user", async () => {
            const adminToken = await createAdminAndLogin();
            await createAndLogin();

            const user = await User.findOne({ email: "user@example.com" });

            const response = await request(app)
                .delete(`/api/admin/users/${user._id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(200);

            const updated = await User.findById(user._id);
            expect(updated.isActive).toBe(false);
        });

        test("prevents deleting an administrator", async () => {
            const adminToken = await createAdminAndLogin();

            const admin = await User.findOne({ email: "admin@example.com" });

            const response = await request(app)
                .delete(`/api/admin/users/${admin._id}`)
                .set(authHeader(adminToken));

            expect(response.status).toBe(403);
        });

        test("returns 400 for an invalid id", async () => {
            const adminToken = await createAdminAndLogin();

            const response = await request(app)
                .delete("/api/admin/users/not-an-id")
                .set(authHeader(adminToken));

            expect(response.status).toBe(400);
        });
    });
});
