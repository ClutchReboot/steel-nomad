jest.mock("expo-sqlite", () => ({
    openDatabaseSync: jest.fn(() => ({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getAllSync: jest.fn(() => []),
        getFirstSync: jest.fn(() => null),
    })),
}));

jest.mock("expo-location", () => ({
    Accuracy: {
        High: 3,
    },
    requestForegroundPermissionsAsync: jest.fn(async () => ({
        status: "granted",
    })),
    watchPositionAsync: jest.fn(async () => ({
        remove: jest.fn(),
    })),
}));