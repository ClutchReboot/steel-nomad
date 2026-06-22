import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
    appendRidePractice,
    getActiveRide,
    getRidePracticeItems,
    initRideDB,
    RideRecord,
} from "../../../services/rideStorage";

type PracticeTrick = {
    id: string;
    title: string;
    description: string;
    accent: string;
    image: ImageSourcePropType;
};

const practiceTricks: PracticeTrick[] = [
    {
        id: "u-turn",
        title: "U-Turns",
        description:
            "Tighten your line, keep your eyes up, and build low-speed control in a safe lane or lot.",
        accent: "#e76f51",
        image: require("../../../../assets/icon.png"),
    },
    {
        id: "figure-8",
        title: "Figure 8s",
        description:
            "Flow from one lean to the other while keeping the bike balanced and your head turned early.",
        accent: "#2a9d8f",
        image: require("../../../../assets/icon.png"),
    },
    {
        id: "slow-weave",
        title: "Slow Weave",
        description:
            "Work on smooth counterbalance, light rear brake, and controlled steering inputs at walking pace.",
        accent: "#f4a261",
        image: require("../../../../assets/icon.png"),
    },
    {
        id: "straight-stop",
        title: "Straight Stops",
        description:
            "Practice progressive braking and a clean stop without upsetting the chassis or locking up the tire.",
        accent: "#264653",
        image: require("../../../../assets/icon.png"),
    },
];

export default function PracticeScreen() {
    const [activeRide, setActiveRide] = useState<RideRecord | null>(() => getActiveRide());

    const loadActiveRide = useCallback(() => {
        setActiveRide(getActiveRide());
    }, []);

    useEffect(() => {
        initRideDB();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadActiveRide();
        }, [loadActiveRide])
    );

    const activePracticeIds = new Set(
        getRidePracticeItems(activeRide?.practiceItems).map((practice) => practice.id)
    );

    function handleAddPractice(trick: PracticeTrick) {
        if (!activeRide) {
            return;
        }

        appendRidePractice(activeRide.id, {
            id: trick.id,
            title: trick.title,
            description: trick.description,
        });

        loadActiveRide();
    }

    return (
        <View style={styles.container}>
            <View style={styles.hero}>
                <Text style={styles.eyebrow}>Practice</Text>
                <Text style={styles.header}>Skills you can log into a ride</Text>
                <Text style={styles.subheader}>
                    Tap a trick while a ride is running to include it in that ride record.
                </Text>

                <View style={styles.statusPill}>
                    <Text style={styles.statusLabel}>
                        {activeRide ? "Ride timer active" : "No active ride"}
                    </Text>
                </View>
            </View>

            <FlatList
                data={practiceTricks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isIncluded = activePracticeIds.has(item.id);
                    const buttonDisabled = !activeRide || isIncluded;

                    return (
                        <View style={styles.card}>
                            <View style={[styles.imageWrap, { backgroundColor: item.accent }]}>
                                <Image source={item.image} style={styles.image} />
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDescription}>{item.description}</Text>

                                <Pressable
                                    style={[
                                        styles.button,
                                        isIncluded && styles.buttonIncluded,
                                        buttonDisabled && styles.buttonDisabled,
                                    ]}
                                    onPress={() => handleAddPractice(item)}
                                    disabled={buttonDisabled}
                                >
                                    <Text style={styles.buttonText}>
                                        {isIncluded
                                            ? "Included in ride"
                                            : activeRide
                                                ? "Add to ride"
                                                : "Start a ride to log"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                }}
                ListHeaderComponent={
                    activeRide ? (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Current ride</Text>
                            <Text style={styles.summaryText}>
                                {getRidePracticeItems(activeRide.practiceItems).length} practice item(s)
                                already attached.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Ready when you are</Text>
                            <Text style={styles.summaryText}>
                                Start a ride, then come back here to tag drills as part of the session.
                            </Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f3ea",
        paddingHorizontal: 16,
        paddingTop: 18,
    },
    hero: {
        marginBottom: 14,
    },
    eyebrow: {
        color: "#6f7a6a",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: 12,
        marginBottom: 6,
        fontWeight: "700",
    },
    header: {
        fontSize: 30,
        fontWeight: "800",
        color: "#1f2933",
        lineHeight: 34,
    },
    subheader: {
        marginTop: 10,
        color: "#4b5563",
        fontSize: 15,
        lineHeight: 21,
    },
    statusPill: {
        alignSelf: "flex-start",
        marginTop: 12,
        backgroundColor: "#1f2933",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    statusLabel: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 24,
    },
    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#ebe3d6",
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1f2933",
        marginBottom: 6,
    },
    summaryText: {
        color: "#5b6470",
        lineHeight: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#ebe3d6",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    imageWrap: {
        borderRadius: 18,
        padding: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        minHeight: 140,
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: 22,
    },
    cardBody: {
        gap: 10,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1f2933",
    },
    cardDescription: {
        color: "#4b5563",
        lineHeight: 20,
    },
    button: {
        backgroundColor: "#1f2933",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    buttonIncluded: {
        backgroundColor: "#2a9d8f",
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 14,
    },
});