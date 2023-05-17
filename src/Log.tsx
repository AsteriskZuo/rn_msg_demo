import * as React from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";

const max_count = 10;

type LogRef = {
  logHandler: (message?: any, ...optionalParams: any[]) => void;
};
type LogProps = {
  propsRef: React.RefObject<LogRef>;
  containerStyle?: StyleProp<ViewStyle> | undefined;
  style?: StyleProp<TextStyle> | undefined;
  maxLineNumber?: number;
};
export const LogMemo = React.memo(
  ({ propsRef, style, containerStyle, maxLineNumber }: LogProps) => {
    const mln = maxLineNumber ?? max_count;
    const [log, setLog] = React.useState("");
    const logRef = React.useRef("");
    if (propsRef.current) {
      propsRef.current.logHandler = (
        message?: any,
        ...optionalParams: any[]
      ) => {
        const arr = [message, ...optionalParams];
        let str = logRef.current;
        for (const a of arr) {
          if (a?.toString) {
            str += a.toString() + " ";
          }
        }
        if (str.trim().length > 0) {
          str += "\n";
        }
        const ret = str.matchAll(/\n/g);
        let count = 0;
        for (const {} of ret) {
          ++count;
        }
        if (count > mln) {
          const pos = str.indexOf("\n");
          if (pos > 0) {
            const t = str.substring(pos + 1);
            logRef.current = t;
          }
        } else {
          logRef.current = str;
        }
        setLog(logRef.current);
      };
    }
    return (
      <ScrollView style={[styles.container, containerStyle]}>
        <Text style={style}>{log}</Text>
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
});
