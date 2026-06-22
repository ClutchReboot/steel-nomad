module.exports = {
    extends: ["expo"],
    ignorePatterns: ["node_modules/", "dist/"],
    overrides: [
        {
            files: ["**/*.test.ts", "**/*.test.tsx", "jest.setup.js"],
            env: {
                jest: true,
            },
            rules: {
                "@typescript-eslint/no-require-imports": "off",
            },
        },
    ],
};