const mongoose = require("mongoose");
const crypto = require("crypto");

const isValidObjectId = (value) =>
    mongoose.Types.ObjectId.isValid(value);

const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;

const isValidEmail = (value) =>
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidPassword = (value) =>
    typeof value === "string" && value.length >= 6;

const isPositiveNumber = (value) =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

const isNonNegativeNumber = (value) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;

// Constant-time comparison to avoid leaking secret length/contents via
// timing. Returns false when either value is not a non-empty string.
const safeEqual = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string") {
        return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    if (bufferA.length !== bufferB.length) {
        return false;
    }

    return crypto.timingSafeEqual(bufferA, bufferB);
};

const isYear = (value) => {
    const year = Number(value);
    return Number.isInteger(year) && year >= 1900 && year <= 2100;
};

const pick = (source, keys) => {
    const result = {};
    keys.forEach((key) => {
        if (source && source[key] !== undefined) {
            result[key] = source[key];
        }
    });
    return result;
};

module.exports = {
    isValidObjectId,
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    isPositiveNumber,
    isNonNegativeNumber,
    safeEqual,
    isYear,
    pick
};
