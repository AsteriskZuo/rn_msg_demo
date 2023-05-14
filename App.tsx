import * as React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { ChatClient, ChatOptions } from "react-native-chat-sdk";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button
        title="test sdk"
        onPress={() => {
          ChatClient.getInstance()
            .init(
              new ChatOptions({
                appKey: "sdf",
                autoLogin: false,
                debugModel: true,
              })
            )
            .then(() => {
              console.log('test:init:success:');
            })
            .catch((e) => {
              console.warn(e);
            });
        }}
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
