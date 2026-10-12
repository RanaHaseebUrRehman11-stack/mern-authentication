const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

const registerUser = async ({
    username = "Test User",
    email = "user@example.com",
    password = "password123"
} = {}) => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({ username, email, password });

    return response;
};

const loginUser = async ({
    email = "user@example.com",
    password = "password123"
} = {}) => {
    const response = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return response;
};

const createAndLogin = async (overrides = {}) => {
    await registerUser(overrides);
    const response = await loginUser(overrides);

    return response.body.token;
};

const createAdminAndLogin = async ({
    email = "admin@example.com",
    password = "adminpassword"
} = {}) => {
    await User.create({
        username: "Admin",
        email,
        password,
        role: "admin"
    });

    const response = await loginUser({ email, password });

    return response.body.token;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = {
    app,
    request,
    registerUser,
    loginUser,
    createAndLogin,
    createAdminAndLogin,
    authHeader
};
