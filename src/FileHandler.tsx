import * as DocumentPicker from "expo-document-picker";

export class FileHandler {
  constructor() {}
  async getFile() {
    const ret: DocumentPicker.DocumentResult =
      await DocumentPicker.getDocumentAsync();
    const { type, ...others } = ret;
    if (type === "cancel") {
      return { ...others, cancelled: true };
    } else {
      return { ...others, cancelled: false };
    }
  }
}
