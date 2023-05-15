import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as React from "react";
import { Picker } from "@react-native-picker/picker";
import { ChatMessageType } from "react-native-chat-sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootParamsList } from "./config";
import { FileHandler } from "./FileHandler";
import { ImageHandler } from "./ImageHandler";
import { VideoHandler } from "./VideoHandler";

type MessageScreenProps = NativeStackScreenProps<typeof RootParamsList>;

export function MessageScreen(props: MessageScreenProps): JSX.Element {
  console.log("MessageScreen:", props);
  const [selectedType, setSelectedType] = React.useState(
    ChatMessageType.TXT.toString()
  );
  const openFile = async () => {
    const ret = await new FileHandler().getFile();
    console.log("test:openFile:", ret);
  };
  const openImage = async () => {
    const ret = await new ImageHandler().getImage();
    console.log("test:openImage:", ret);
  };
  const openCamera = async () => {
    const ret = await new ImageHandler().getCamera();
    console.log("test:openCamera:", ret);
  };
  const openVideo = async () => {
    const video = new VideoHandler();
    const ret = await video.getVideo();
    console.log("test:openVideo:", ret);
    if (ret.cancelled !== true) {
      const _ret = await video.getThumbnail({ fileName: ret.uri });
      console.log("test:openVideo:", _ret);
    }
  };
  const RenderVoiceButton = React.memo(
    ({ onStart, onEnd }: { onStart?: () => void; onEnd?: () => void }) => {
      const startRecordContent = "Start Record" as
        | "Start Record"
        | "Stop Record";
      const stopRecordContent = "Stop Record" as "Start Record" | "Stop Record";
      const [voiceButtonContent, setVoiceButtonContent] =
        React.useState(startRecordContent);
      return (
        <Pressable
          style={styles.button2}
          onPressIn={() => {
            console.log("test:Pressable:onPressIn:");
            setVoiceButtonContent(stopRecordContent);
            onStart?.();
          }}
          onPressOut={() => {
            console.log("test:Pressable:onPressOut:");
            setVoiceButtonContent(startRecordContent);
            onEnd?.();
          }}
        >
          <Text style={styles.buttonText}>{voiceButtonContent}</Text>
        </Pressable>
      );
    }
  );
  const RenderBody = ({ type }: { type: ChatMessageType }) => {
    let ret = <View />;
    switch (type) {
      case ChatMessageType.CMD:
        break;
      case ChatMessageType.FILE:
        ret = (
          <View style={styles.file}>
            <Text style={{ flex: 1 }} numberOfLines={10}>
              This is file info.
            </Text>
            <Pressable
              style={styles.button2}
              onPress={() => {
                openFile();
              }}
            >
              <Text style={styles.buttonText}>Select File</Text>
            </Pressable>
          </View>
        );
        break;
      case ChatMessageType.CUSTOM:
        break;
      case ChatMessageType.IMAGE:
        ret = (
          <View style={[styles.image, { flexDirection: "column" }]}>
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[styles.button2, { marginRight: 20 }]}
                onPress={() => {
                  openImage();
                }}
              >
                <Text style={styles.buttonText}>Select Image</Text>
              </Pressable>
              <Pressable
                style={styles.button2}
                onPress={() => {
                  openCamera();
                }}
              >
                <Text style={styles.buttonText}>Open Camera</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ flexWrap: "wrap" }} numberOfLines={10}>
                This is file info.
              </Text>
            </View>
          </View>
        );
        break;
      case ChatMessageType.LOCATION:
        break;
      case ChatMessageType.TXT:
        ret = (
          <View style={styles.txt}>
            <TextInput placeholder="Please input text content..." />
          </View>
        );
        break;
      case ChatMessageType.VIDEO:
        ret = (
          <View style={styles.file}>
            <Text style={{ flex: 1 }} numberOfLines={10}>
              This is file info.
            </Text>
            <Pressable
              style={styles.button2}
              onPress={() => {
                openVideo();
              }}
            >
              <Text style={styles.buttonText}>Select Video</Text>
            </Pressable>
          </View>
        );
        break;
      case ChatMessageType.VOICE:
        ret = (
          <View style={styles.file}>
            <Text style={{ flex: 1 }} numberOfLines={10}>
              This is file info.
            </Text>
            <RenderVoiceButton
              onStart={() => {
                console.log("test:onStart:");
              }}
              onEnd={() => {
                console.log("test:onEnd:");
              }}
            />
          </View>
        );
        break;

      default:
        break;
    }
    return ret;
  };
  return (
    <View
      style={{
        flex: 1,
        // backgroundColor: "green",
      }}
    >
      <View
        style={{
          flex: 1,
          // backgroundColor: "red",
        }}
      ></View>
      <View
        style={{
          // backgroundColor: "yellow",
          padding: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Picker
            style={{
              height: 30,
              width: 150,
            }}
            selectedValue={selectedType}
            onValueChange={(itemValue, _) => setSelectedType(itemValue)}
          >
            <Picker.Item
              label={ChatMessageType.CMD}
              value={ChatMessageType.CMD.toString()}
            />
            <Picker.Item
              label={ChatMessageType.CUSTOM}
              value={ChatMessageType.CUSTOM.toString()}
            />
            <Picker.Item
              label={ChatMessageType.FILE}
              value={ChatMessageType.FILE.toString()}
            />
            <Picker.Item
              label={ChatMessageType.IMAGE}
              value={ChatMessageType.IMAGE.toString()}
            />
            <Picker.Item
              label={ChatMessageType.LOCATION}
              value={ChatMessageType.LOCATION.toString()}
            />
            <Picker.Item
              label={ChatMessageType.TXT}
              value={ChatMessageType.TXT.toString()}
            />
            <Picker.Item
              label={ChatMessageType.VIDEO}
              value={ChatMessageType.VIDEO.toString()}
            />
            <Picker.Item
              label={ChatMessageType.VOICE}
              value={ChatMessageType.VOICE.toString()}
            />
          </Picker>
          <Pressable
            style={styles.button}
            onPress={() => {
              console.log("test:Pressable:onPress:");
            }}
          >
            <Text style={styles.buttonText}>Send Message</Text>
          </Pressable>
        </View>
        <RenderBody type={selectedType as ChatMessageType} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    marginHorizontal: 10,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button2: {
    padding: 10,
    height: 40,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  file: {
    // backgroundColor: "green",
    borderRadius: 5,
    justifyContent: "center",
    flexDirection: "row",
  },
  image: {
    // backgroundColor: "green",
    borderRadius: 5,
    justifyContent: "center",
    flexDirection: "row",
  },
  txt: {
    backgroundColor: "#d3d3d3",
    overflow: "hidden",
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
});
