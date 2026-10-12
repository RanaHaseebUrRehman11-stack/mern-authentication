const {
    app,
    request,
    createAndLogin,
    authHeader
} = require("./helpers");
const Vehicle = require("../models/vehicle");

const validVehicle = {
    vehicleNumber: "ABC-123",
    company: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "White",
    vehicleType: "Car"
};

describe("Vehicles", () => {
    test("registers a vehicle for the authenticated user", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        expect(response.status).toBe(201);
        expect(response.body.vehicle.vehicleNumber).toBe("ABC-123");
    });

    test("rejects missing required fields with 400", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send({ company: "Toyota" });

        expect(response.status).toBe(400);
    });

    test("rejects duplicate vehicle numbers", async () => {
        const token = await createAndLogin();

        await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        const response = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        expect(response.status).toBe(400);
    });

    test("requires authentication", async () => {
        const response = await request(app)
            .post("/api/vehicles")
            .send(validVehicle);

        expect(response.status).toBe(401);
    });

    test("lists only the authenticated user's vehicles", async () => {
        const firstToken = await createAndLogin({ email: "first@example.com" });
        const secondToken = await createAndLogin({ email: "second@example.com" });

        await request(app)
            .post("/api/vehicles")
            .set(authHeader(firstToken))
            .send(validVehicle);

        const response = await request(app)
            .get("/api/vehicles/my-vehicles")
            .set(authHeader(secondToken));

        expect(response.status).toBe(200);
        expect(response.body.vehicles).toHaveLength(0);
    });

    test("updates an owned vehicle", async () => {
        const token = await createAndLogin();

        const created = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        const response = await request(app)
            .put(`/api/vehicles/${created.body.vehicle._id}`)
            .set(authHeader(token))
            .send({ color: "Black" });

        expect(response.status).toBe(200);
        expect(response.body.vehicle.color).toBe("Black");
    });

    test("ignores attempts to change the owner (mass assignment)", async () => {
        const token = await createAndLogin();

        const created = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        const originalOwner = created.body.vehicle.owner;

        const response = await request(app)
            .put(`/api/vehicles/${created.body.vehicle._id}`)
            .set(authHeader(token))
            .send({ owner: "000000000000000000000000" });

        expect(response.status).toBe(200);
        expect(response.body.vehicle.owner).toBe(originalOwner);
    });

    test("cannot update another user's vehicle (404)", async () => {
        const ownerToken = await createAndLogin({ email: "owner@example.com" });
        const otherToken = await createAndLogin({ email: "other@example.com" });

        const created = await request(app)
            .post("/api/vehicles")
            .set(authHeader(ownerToken))
            .send(validVehicle);

        const response = await request(app)
            .put(`/api/vehicles/${created.body.vehicle._id}`)
            .set(authHeader(otherToken))
            .send({ color: "Black" });

        expect(response.status).toBe(404);
    });

    test("removes a vehicle the user owns", async () => {
        const token = await createAndLogin();

        const created = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        const response = await request(app)
            .delete(`/api/vehicles/${created.body.vehicle._id}`)
            .set(authHeader(token));

        expect(response.status).toBe(200);

        const count = await Vehicle.countDocuments();
        expect(count).toBe(0);
    });

    test("does not delete a vehicle referenced by a service request (409)", async () => {
        const token = await createAndLogin();

        const created = await request(app)
            .post("/api/vehicles")
            .set(authHeader(token))
            .send(validVehicle);

        await request(app)
            .post("/api/service-requests")
            .set(authHeader(token))
            .send({
                vehicle: created.body.vehicle._id,
                serviceType: "Oil Change",
                description: "Routine"
            });

        const response = await request(app)
            .delete(`/api/vehicles/${created.body.vehicle._id}`)
            .set(authHeader(token));

        expect(response.status).toBe(409);
        expect(await Vehicle.countDocuments()).toBe(1);
    });
});
