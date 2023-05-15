/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { accountType, appKey, dlog } from "./src/config";
import { MainScreen } from "./src/Main";
import { MessageScreen } from "./src/Message";
import { AppServerClient } from "./src/AppServerClient";
import { ChatClient, ChatOptions } from "react-native-chat-sdk";
import { ActivityIndicator } from "react-native";

const Root = createNativeStackNavigator();

const App = () => {
  // return <View style={{flex: 1, backgroundColor: 'red'}}/>;
  dlog.log("App:");
  const [ready, setReady] = React.useState(false);
  const enableLog = true;

  if (accountType !== "easemob") {
    AppServerClient.rtcTokenUrl = "https://a41.easemob.com/token/rtc/channel";
    AppServerClient.mapUrl = "https://a41.easemob.com/agora/channel/mapper";
  }

  if (ready === false) {
    const init = () => {
      ChatClient.getInstance()
        .init(
          new ChatOptions({
            appKey: appKey,
            autoLogin: false,
            debugModel: enableLog,
          })
        )
        .then(() => {
          setReady(true);
        })
        .catch((e) => {
          console.warn("init:error:", e);
        });
    };
    init();
  }

  if (ready === false) {
    return <ActivityIndicator />;
  }

  return (
    <NavigationContainer>
      <Root.Navigator initialRouteName="Main">
        <Root.Screen name="Main" component={MainScreen} />
        <Root.Screen
          options={() => {
            return {
              headerShown: true,
              presentation: "fullScreenModal",
            };
          }}
          name="Message"
          component={MessageScreen}
        />
      </Root.Navigator>
    </NavigationContainer>
  );
};

export default App;


// import * as React from "react";
// import { Button, StyleSheet, Text, View } from "react-native";
// import { ChatClient, ChatOptions } from "react-native-chat-sdk";

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <Button
//         title="test sdk"
//         onPress={() => {
//           ChatClient.getInstance()
//             .init(
//               new ChatOptions({
//                 appKey: "sdf",
//                 autoLogin: false,
//                 debugModel: true,
//               })
//             )
//             .then(() => {
//               console.log('test:init:success:');
//             })
//             .catch((e) => {
//               console.warn(e);
//             });
//         }}
//       ></Button>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
