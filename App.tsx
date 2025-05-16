import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';

type cordinates = {
  x: number;
  y: number;
  z: number;
}

export default function App() {
  const [data, setData] = useState<cordinates>({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

    const subscribe = () => {
    Accelerometer.setUpdateInterval(250);
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      checkForFall(accelerometerData);
    });
    return subscription;
  };

  const checkForFall = async ({ x, y, z }: cordinates) => {
    const limit = 1.5; // Limite de aceleração para detecção de queda
    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      alertFall(location);
    }
  };

    const alertFall = (location: Location.LocationObject) => {
    Alert.alert(
      "Queda Detectada",
      `Uma queda foi detectada. Localização: ${location.coords.latitude}, ${location.coords.longitude}`,
      [{ text: "OK" }]
    );
  };




  const unsubscribe = () => {
    Accelerometer.removeAllListeners();
  };


    useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
  }, []);



  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>

      <View style={styles.container}>
        <Text style={styles.text}>Detector de Quedas</Text>
        <Text style={styles.text}>
          Data:
          {data &&
            <>
              {Object.entries(data).map((object) => `\n${object[0]} ${object[1].toFixed(5)}`)}
            </>
          }
          </Text>
        <Text style={styles.text}>{errorMsg ? errorMsg : `Latitude: ${location ? location.coords.latitude : ''}, Longitude: ${location ? location.coords.longitude : ''}`}</Text>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
});
