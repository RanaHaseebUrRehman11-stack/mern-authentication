const {
    app,
    request,
    createAndLogin,
    createAdminAndLogin,
    authHeader
} = require("./helpers");
const Mechanic = require("../models/mechanic");

const validMechanic = {
    name: "Jane Mechanic",
    email: "jane@example.com",
    phone: "1234567890",
    specialization: "Engine",
    experience: 5
};

describe("Mechanics", () => {
    test("blocks non-admin users", async () => {
        const token = await createAndLogin();

        const response = await request(app)
            .get("/api/admin/mechanics")
            .set(authHeader(token));

        expect(response.status).toBe(403);
    });

    test("allows an admin to create a mechanic", async () => {
        const adminToken = await createAdminAndLogin();

        const response = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send(validMechanic);

        expect(response.status).toBe(201);
        expect(response.body.mechanic.email).toBe("jane@example.com");
    });

    test("validates mechanic input", async () => {
        const adminToken = await createAdminAndLogin();

        const response = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send({ name: "Incomplete" });

        expect(response.status).toBe(400);
    });

    test("rejects duplicate mechanic email", async () => {
        const adminToken = await createAdminAndLogin();

        await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send(validMechanic);

        const response = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send(validMechanic);

        expect(response.status).toBe(400);
    });

    test("updates only allow-listed fields", async () => {
        const adminToken = await createAdminAndLogin();

        const created = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send(validMechanic);

        const response = await request(app)
            .put(`/api/admin/mechanics/${created.body.mechanic._id}`)
            .set(authHeader(adminToken))
            .send({ specialization: "Brakes", role: "admin" });

        expect(response.status).toBe(200);
        expect(response.body.mechanic.specialization).toBe("Brakes");
        expect(response.body.mechanic.role).toBeUndefined();
    });

    test("deletes a mechanic", async () => {
        const adminToken = await createAdminAndLogin();

        const created = await request(app)
            .post("/api/admin/mechanics")
            .set(authHeader(adminToken))
            .send(validMechanic);

        const response = await request(app)
            .delete(`/api/admin/mechanics/${created.body.mechanic._id}`)
            .set(authHeader(adminToken));

        expect(response.status).toBe(200);

        const count = await Mechanic.countDocuments();
        expect(count).toBe(0);
    });
});
