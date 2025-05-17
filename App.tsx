import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

type CoordinatesType = {
  x: number;
  y: number;
  z: number;
};

export default function App() {
  const [data, setData] = useState<CoordinatesType>({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  function subscribe() {
    const intervalMs = 250;
    Accelerometer.setUpdateInterval(intervalMs);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      setData(accelerometerData);
      checkForFall(accelerometerData);
    });

    return subscription;
  }

  async function checkForFall({ x, y, z }: CoordinatesType) {
    const limit = 1.5; // Limite de aceleração para detecção de queda

    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      const location = await Location.getCurrentPositionAsync({});

      setLocation(location);
      alertFall(location);
    }
  }

  function alertFall(location: Location.LocationObject) {
    const { latitude, longitude } = location.coords;

    Alert.alert(
      "Queda Detectada",
      `Uma queda foi detectada. Localização: ${latitude}, ${longitude}`,
      [{ text: "OK" }]
    );
  }

  const unsubscribe = () => {
    Accelerometer.removeAllListeners();
  };

  function getLocationAndLatitudeText(
    location: Location.LocationObject | null
  ) {
    if (location == null) return "";
    const { latitude, longitude } = location.coords;
    return `Latitude: ${latitude}\nLongitude: ${longitude}`;
  }

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMessage("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detector de Quedas</Text>
      <Text style={styles.text}>
        Data:
        {data && (
          <>
            {Object.entries(data).map(
              (object) => `\n${object[0]} ${object[1].toFixed(5)}`
            )}
          </>
        )}
      </Text>
      <Text style={styles.text}>
        {errorMessage ? errorMessage : 
          <> {getLocationAndLatitudeText(location)} </>
          }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    margin: 10,
  },
});
