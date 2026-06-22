module.exports = {
    preset: "jest-expo",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
};