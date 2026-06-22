import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Text, View } from "react-native";
import MaintenanceScreen from "../features/maintenance/screens/MaintenanceScreen";
import PracticeScreen from "../features/practice/screens/PracticeScreen";
import RidesScreen from "../features/rides/screens/RidesScreen";

const Tab = createBottomTabNavigator();

function WeatherScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>🌦 Weather</Text>
        </View>
    );
}

export default function RootTabs() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Rides" component={RidesScreen} />
                <Tab.Screen name="Practice" component={PracticeScreen} />
                <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
                <Tab.Screen name="Weather" component={WeatherScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}