import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as React from "react";
import { Picker } from "@react-native-picker/picker";
import {
  ChatClient,
  ChatError,
  ChatFileMessageBody,
  ChatImageMessageBody,
  ChatMessage,
  ChatMessageEventListener,
  ChatMessageStatusCallback,
  ChatMessageType,
  ChatTextMessageBody,
  ChatVideoMessageBody,
  ChatVoiceMessageBody,
} from "react-native-chat-sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootParamsList } from "./config";
import { FileHandler } from "./FileHandler";
import { ImageHandler } from "./ImageHandler";
import { VideoHandler } from "./VideoHandler";
import {
  FileMessageItemType,
  ImageMessageItemType,
  InsertDirectionType,
  MessageBubbleList,
  MessageBubbleListRef,
  MessageItemType,
  TextMessageItemType,
  VideoMessageItemType,
  VoiceMessageItemType,
} from "./MessageBubbleList";
import { VoiceHandler } from "./VoiceHandler";

type MessageScreenProps = NativeStackScreenProps<typeof RootParamsList>;

export function MessageScreen({ route }: MessageScreenProps): JSX.Element {
  console.log("MessageScreen:", route);
  const params = route.params as any;
  const currentId = params?.currentId ?? "";
  const chatId = params?.chatId ?? "";
  const chatType = params?.chatType ?? 0;
  const [selectedType, setSelectedType] = React.useState(
    ChatMessageType.TXT.toString()
  );
  const msgRef = React.useRef<MessageBubbleListRef>({} as any);
  const contentRef = React.useRef({} as any);
  const seqId = React.useRef(0);
  const [json, setJson] = React.useState("This is file info.");
  const voiceRef = React.useRef<VoiceHandler | undefined>();

  const genBubbleData = () => {
    let ret = {} as
      | {
          msgs: MessageItemType[];
          direction: InsertDirectionType;
        }
      | undefined;
    const t = selectedType as ChatMessageType;
    ret = {
      msgs: [
        {
          sender: currentId,
          timestamp: Date.now(),
          isSender: true,
          key: seqId.current.toString(),
          msgId: seqId.current.toString(),
          state: "sending",
          onPress: (item) => {
            if (
              item.type === ChatMessageType.FILE ||
              item.type === ChatMessageType.VIDEO ||
              item.type === ChatMessageType.IMAGE
            ) {
              ChatClient.getInstance()
                .chatManager.getMessage(item.msgId)
                .then((msg) => {
                  if (msg) {
                    ChatClient.getInstance()
                      .chatManager.downloadAttachment(msg, {
                        onProgress: (localMsgId: string, progress: number) => {
                          console.log("test:onProgress:", localMsgId, progress);
                        },
                        onError: (localMsgId: string, error: ChatError) => {
                          console.log("test:onError:", localMsgId, error);
                        },
                        onSuccess: (message: ChatMessage) => {
                          // TODO: update status
                        },
                      } as ChatMessageStatusCallback)
                      .then()
                      .catch();
                  }
                })
                .catch();
            }
          },
          onLongPress: (data) => {},
        } as MessageItemType,
      ],
      direction: "after",
    };
    ++seqId.current;
    switch (t) {
      case ChatMessageType.CMD:
        ret = undefined;
        break;
      case ChatMessageType.CUSTOM:
        ret = undefined;
        break;
      case ChatMessageType.FILE:
        {
          let msg = ret.msgs[0] as FileMessageItemType;
          msg.type = ChatMessageType.FILE;
          const file = contentRef.current.file as {
            name: string;
            size?: number | undefined;
            uri: string;
            mimeType?: string | undefined;
            lastModified?: number | undefined;
            file?: any;
            output?: any;
          };
          msg.displayName = file.name;
          msg.localPath = file.uri ?? "";
        }
        break;
      case ChatMessageType.IMAGE:
        {
          let msg = ret.msgs[0] as ImageMessageItemType;
          msg.type = ChatMessageType.IMAGE;
          const image = contentRef.current.image as {
            uri: string;
            width: number;
            height: number;
            exif?: Record<string, any>;
            base64?: string;
            duration?: number;
          };
          msg.localPath = image.uri;
          msg.width = image.width;
          msg.height = image.height;
        }

        break;
      case ChatMessageType.LOCATION:
        ret = undefined;
        break;
      case ChatMessageType.TXT:
        {
          let msg = ret.msgs[0] as TextMessageItemType;
          msg.type = ChatMessageType.TXT;
          msg.text = contentRef.current?.text;
        }
        break;
      case ChatMessageType.VIDEO:
        {
          let msg = ret.msgs[0] as VideoMessageItemType;
          msg.type = ChatMessageType.VIDEO;
          const video = contentRef.current.video as {
            uri: string;
            width: number;
            height: number;
            exif?: Record<string, any>;
            base64?: string;
            duration?: number;
          };
          const thumb = contentRef.current.thumb as {
            uri: string;
            width: number;
            height: number;
          };
          msg.localPath = video.uri;
          msg.thumbnailLocalPath = thumb.uri;
        }
        break;
      case ChatMessageType.VOICE:
        {
          let msg = ret.msgs[0] as VoiceMessageItemType;
          msg.type = ChatMessageType.VOICE;
          const voice = contentRef.current.voice as {
            uri: string;
            duration: number;
          };
          msg.localPath = voice.uri;
          msg.duration = voice.duration;
        }
        break;

      default:
        ret = undefined;
        break;
    }
    return ret;
  };
  const genMsgData = () => {
    return {} as any;
  };
  const onSend = () => {
    const ret = genBubbleData();
    if (ret) {
      msgRef.current?.addMessage(ret);
    }
  };

  const openFile = async () => {
    const ret = await new FileHandler().getFile();
    console.log("test:openFile:", ret);
    if (ret.cancelled !== true) {
      contentRef.current = { file: ret };
      setJson(JSON.stringify(contentRef.current));
    }
  };
  const openImage = async () => {
    const ret = await new ImageHandler().getImage();
    console.log("test:openImage:", ret);
    if (ret.cancelled !== true) {
      contentRef.current = { image: ret };
      setJson(JSON.stringify(contentRef.current));
    }
  };
  const openCamera = async () => {
    const ret = await new ImageHandler().getCamera();
    console.log("test:openCamera:", ret);
    if (ret.cancelled !== true) {
      contentRef.current = { image: ret };
      setJson(JSON.stringify(contentRef.current));
    }
  };
  const openVideo = async () => {
    const video = new VideoHandler();
    const ret = await video.getVideo();
    console.log("test:openVideo:", ret);
    if (ret.cancelled !== true) {
      const _ret = await video.getThumbnail({ fileName: ret.uri });
      console.log("test:openVideo:", _ret);
      contentRef.current = { video: ret, thumb: _ret };
      setJson(JSON.stringify(contentRef.current));
    }
  };
  const stopRecord = async () => {
    if (voiceRef.current) {
      const ret = await voiceRef.current.stopRecording();
      console.log("test:stopRecord:", ret);
      contentRef.current = { voice: ret };
      setJson(JSON.stringify(contentRef.current));
      voiceRef.current = undefined;
    }
  };

  React.useEffect(() => {
    const genBubbleDataFromServer = (message: ChatMessage) => {
      let ret = {} as
        | {
            msgs: MessageItemType[];
            direction: InsertDirectionType;
          }
        | undefined;
      const t = message.body.type;
      ret = {
        msgs: [
          {
            sender: message.from,
            timestamp: message.serverTime,
            isSender: message.from === currentId ? true : false,
            key: seqId.current.toString(),
            msgId: message.msgId,
            state: "arrived",
            onPress: (item) => {
              if (
                item.type === ChatMessageType.FILE ||
                item.type === ChatMessageType.VIDEO ||
                item.type === ChatMessageType.IMAGE
              ) {
                ChatClient.getInstance()
                  .chatManager.getMessage(item.msgId)
                  .then((msg) => {
                    if (msg) {
                      ChatClient.getInstance()
                        .chatManager.downloadAttachment(msg, {
                          onProgress: (
                            localMsgId: string,
                            progress: number
                          ) => {
                            console.log(
                              "test:onProgress:",
                              localMsgId,
                              progress
                            );
                          },
                          onError: (localMsgId: string, error: ChatError) => {
                            console.log("test:onError:", localMsgId, error);
                          },
                          onSuccess: (message: ChatMessage) => {
                            // TODO: update status
                          },
                        } as ChatMessageStatusCallback)
                        .then()
                        .catch();
                    }
                  })
                  .catch();
              }
            },
            onLongPress: (data) => {},
          } as MessageItemType,
        ],
        direction: "after",
      };
      ++seqId.current;
      switch (t) {
        case ChatMessageType.CMD:
          ret = undefined;
          break;
        case ChatMessageType.CUSTOM:
          ret = undefined;
          break;
        case ChatMessageType.FILE:
          {
            let msg = ret.msgs[0] as FileMessageItemType;
            const body = message.body as ChatFileMessageBody;
            msg.type = ChatMessageType.FILE;
            msg.displayName = body.displayName;
            msg.localPath = body.localPath;
            msg.remoteUrl = body.remotePath;
          }
          break;
        case ChatMessageType.IMAGE:
          {
            let msg = ret.msgs[0] as ImageMessageItemType;
            const body = message.body as ChatImageMessageBody;
            msg.type = ChatMessageType.IMAGE;
            msg.localPath = body.localPath;
            msg.remoteUrl = body.remotePath;
            msg.remoteThumbPath = body.thumbnailRemotePath;
            msg.localThumbPath = body.thumbnailLocalPath;
            msg.width = body.width;
            msg.height = body.height;
          }

          break;
        case ChatMessageType.LOCATION:
          ret = undefined;
          break;
        case ChatMessageType.TXT:
          {
            let msg = ret.msgs[0] as TextMessageItemType;
            const body = message.body as ChatTextMessageBody;
            msg.type = ChatMessageType.TXT;
            msg.text = body.content;
          }
          break;
        case ChatMessageType.VIDEO:
          {
            let msg = ret.msgs[0] as VideoMessageItemType;
            const body = message.body as ChatVideoMessageBody;
            msg.type = ChatMessageType.VIDEO;
            msg.localPath = body.localPath;
            msg.remoteUrl = body.remotePath;
            msg.thumbnailLocalPath = body.thumbnailLocalPath;
            msg.thumbnailRemoteUrl = body.thumbnailRemotePath;
          }
          break;
        case ChatMessageType.VOICE:
          {
            let msg = ret.msgs[0] as VoiceMessageItemType;
            const body = message.body as ChatVoiceMessageBody;
            msg.type = ChatMessageType.VOICE;
            msg.localPath = body.localPath;
            msg.remoteUrl = body.remotePath;
            msg.duration = body.duration;
          }
          break;

        default:
          ret = undefined;
          break;
      }
      return ret;
    };
    const listener = {
      onMessagesReceived: (messages: Array<ChatMessage>) => {
        for (const message of messages) {
          if (
            message.body.type === ChatMessageType.TXT ||
            message.body.type === ChatMessageType.FILE ||
            message.body.type === ChatMessageType.IMAGE ||
            message.body.type === ChatMessageType.VIDEO ||
            message.body.type === ChatMessageType.VOICE
          ) {
            const ret = genBubbleDataFromServer(message);
            if (ret) {
              msgRef.current?.addMessage(ret);
            }
          }
        }
      },
    } as ChatMessageEventListener;
    ChatClient.getInstance().chatManager.addMessageListener(listener);
    return () => {
      ChatClient.getInstance().chatManager.removeAllMessageListener();
    };
  }, []);

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
            setVoiceButtonContent(stopRecordContent);
            onStart?.();
          }}
          onPressOut={() => {
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
            <Text style={{ flex: 1 }} numberOfLines={20}>
              {json}
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
              <Text style={{ flexWrap: "wrap" }} numberOfLines={20}>
                {json}
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
            <TextInput
              placeholder="Please input text content..."
              onChangeText={(t) => {
                contentRef.current = { text: t };
              }}
            />
          </View>
        );
        break;
      case ChatMessageType.VIDEO:
        ret = (
          <View style={styles.file}>
            <Text style={{ flex: 1 }} numberOfLines={20}>
              {json}
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
            <Text style={{ flex: 1 }} numberOfLines={20}>
              {json}
            </Text>
            <RenderVoiceButton
              onStart={() => {
                voiceRef.current = new VoiceHandler({ type: "record" });
                voiceRef.current.startRecording();
              }}
              onEnd={() => {
                stopRecord();
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
      >
        <MessageBubbleList propRef={msgRef} />
      </View>
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
              onSend();
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
