const {
    app,
    request,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");

const createVehicle = async (token, overrides = {}) => {
    const response = await request(app)
        .post("/api/vehicles")
        .set(authHeader(token))
        .send({
            vehicleNumber: "ABC-123",
            company: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "White",
            ...overrides
        });

    return response.body.vehicle;
};

const createMechanic = async (adminToken) => {
    const response = await request(app)
        .post("/api/admin/mechanics")
        .set(authHeader(adminToken))
        .send({
            name: "Mech",
            email: "mech@example.com",
            phone: "1234567890",
            specialization: "Engine",
            experience: 5
        });

    return response.body.mechanic;
};

describe("Service Requests", () => {
    test("creates a request for an owned vehicle", async () => {
        const token = await createAndLogin();
        const vehicle = await createVehicle(token);

        const response = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine maintenance"
            });

        expect(response.status).toBe(201);
        expect(response.body.serviceRequest.status).toBe("Pending");
    });

    test("rejects a request for another user's vehicle (404)", async () => {
        const ownerToken = await createAndLogin({ email: "owner@example.com" });
        const otherToken = await createAndLogin({ email: "other@example.com" });
        const vehicle = await createVehicle(ownerToken);

        const response = await request(app)
            .post("/api/service-requests")
            .set(authHeader(otherToken))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Nope"
            });

        expect(response.status).toBe(404);
    });

    test("rejects an invalid vehicle id (400)", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: "not-an-id",
                serviceType: "Oil Change",
                description: "Nope"
            });

        expect(response.status).toBe(400);
    });

    test("lists only the authenticated user's requests", async () => {
        const token = await createAndLogin();
        const vehicle = await createVehicle(token);

        await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .get("/api/service-requests/my-requests")
            .set(authHeader(token));

        expect(response.status).toBe(200);
        expect(response.body.requests).toHaveLength(1);
    });

    test("lets an admin view all requests", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);

        await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .get("/api/service-requests")
            .set(authHeader(adminToken));

        expect(response.status).toBe(200);
        expect(response.body.requests).toHaveLength(1);
    });

    test("assigns a mechanic and sets status to Assigned", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);
        const mechanic = await createMechanic(adminToken);

        const created = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .put(`/api/service-requests/${created.body.serviceRequest._id}/assign`)
            .set(authHeader(adminToken))
            .send({ mechanic: mechanic._id });

        expect(response.status).toBe(200);
        expect(response.body.serviceRequest.status).toBe("Assigned");
        expect(response.body.serviceRequest.mechanic.name).toBe("Mech");
    });

    test("rejects an invalid status value (400)", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);

        const created = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .put(`/api/service-requests/${created.body.serviceRequest._id}/status`)
            .set(authHeader(adminToken))
            .send({ status: "NotAStatus" });

        expect(response.status).toBe(400);
    });

    test("walks the lifecycle and returns completed history", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);
        const mechanic = await createMechanic(adminToken);

        const created = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const requestId = created.body.serviceRequest._id;

        const pendingHistory = await request(app)
            .get("/api/service-requests/history")
            .set(authHeader(token));

        expect(pendingHistory.body.history).toHaveLength(0);

        await request(app)
            .put(`/api/service-requests/${requestId}/assign`)
            .set(authHeader(adminToken))
            .send({ mechanic: mechanic._id });

        await request(app)
            .put(`/api/service-requests/${requestId}/status`)
            .set(authHeader(adminToken))
            .send({ status: "In Progress" });

        await request(app)
            .put(`/api/service-requests/${requestId}/status`)
            .set(authHeader(adminToken))
            .send({ status: "Completed" });

        const history = await request(app)
            .get("/api/service-requests/history")
            .set(authHeader(token));

        expect(history.status).toBe(200);
        expect(history.body.history).toHaveLength(1);
        expect(history.body.history[0].status).toBe("Completed");
        expect(history.body.history[0].completedAt).toBeTruthy();
    });

    test("blocks an invalid admin transition (Pending -> Completed)", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);

        const created = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .put(
                `/api/service-requests/${created.body.serviceRequest._id}/status`
            )
            .set(authHeader(adminToken))
            .send({ status: "Completed" });

        expect(response.status).toBe(400);
    });

    test("treats an unchanged status update as idempotent", async () => {
        const token = await createAndLogin();
        const adminToken = await createAdminAndLogin();
        const vehicle = await createVehicle(token);

        const created = await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .put(
                `/api/service-requests/${created.body.serviceRequest._id}/status`
            )
            .set(authHeader(adminToken))
            .send({ status: "Pending" });

        expect(response.status).toBe(200);
        expect(response.body.serviceRequest.status).toBe("Pending");
    });
});
