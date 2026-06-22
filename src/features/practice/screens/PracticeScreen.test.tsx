import React from "react";
import { Text } from "react-native";
import { act, create } from "react-test-renderer";

const mockAppendRidePractice = jest.fn();
const mockGetActiveRide = jest.fn();
const mockGetRidePracticeItems = jest.fn();
const mockInitRideDB = jest.fn();

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
}));

jest.mock("../../../services/rideStorage", () => ({
    appendRidePractice: mockAppendRidePractice,
    getActiveRide: mockGetActiveRide,
    getRidePracticeItems: mockGetRidePracticeItems,
    initRideDB: mockInitRideDB,
}));

const PracticeScreen = require("./PracticeScreen").default as typeof import("./PracticeScreen").default;

function getTextContent(node: any): string {
    if (!node) {
        return "";
    }

    if (typeof node === "string") {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map(getTextContent).join(" ");
    }

    return getTextContent(node.children);
}

function countTextNodes(renderer: ReturnType<typeof create>, value: string) {
    return renderer.root
        .findAllByType(Text)
        .filter((node: any) => getTextContent(node.props.children) === value).length;
}

describe("PracticeScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRide.mockReturnValue(null);
        mockGetRidePracticeItems.mockReturnValue([]);
    });

    it("shows the practice catalog when no ride is active", () => {
        let renderer: ReturnType<typeof create>;

        act(() => {
            renderer = create(<PracticeScreen />);
        });

        expect(countTextNodes(renderer!, "No active ride")).toBeGreaterThan(0);
        expect(countTextNodes(renderer!, "U-Turns")).toBeGreaterThan(0);
        expect(countTextNodes(renderer!, "Start a ride to log")).toBe(4);
        expect(mockInitRideDB).toHaveBeenCalledTimes(1);
    });

    it("adds the selected trick to the active ride", () => {
        mockGetActiveRide.mockReturnValue({
            id: "ride-1",
            startTime: "2026-06-22T00:00:00.000Z",
            endTime: null,
            durationMs: null,
            route: "[]",
            practiceItems: JSON.stringify([
                {
                    id: "u-turn",
                    title: "U-Turns",
                    description:
                        "Tighten your line, keep your eyes up, and build low-speed control in a safe lane or lot.",
                    selectedAt: "2026-06-22T00:00:00.000Z",
                },
            ]),
        });

        mockGetRidePracticeItems.mockImplementation((practiceItems: string | null | undefined) =>
            practiceItems ? JSON.parse(practiceItems) : []
        );

        let renderer: ReturnType<typeof create>;

        act(() => {
            renderer = create(<PracticeScreen />);
        });

        expect(countTextNodes(renderer!, "Ride timer active")).toBeGreaterThan(0);
        expect(countTextNodes(renderer!, "Included in ride")).toBeGreaterThan(0);
        expect(countTextNodes(renderer!, "Add to ride")).toBe(3);
        expect(mockAppendRidePractice).not.toHaveBeenCalled();
    });
});