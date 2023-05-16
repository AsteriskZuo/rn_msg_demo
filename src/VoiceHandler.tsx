import * as Audio from "expo-av";
import * as Asset from "expo-asset";
export class VoiceHandler {
  private _sound?: Audio.Audio.Sound;
  private _soundStatus?: Audio.AVPlaybackStatus;
  private _recording?: Audio.Audio.Recording;
  private _recordingStatus?: Audio.Audio.RecordingStatus;
  constructor(params: {
    type: "playback" | "record";
    file?: number | Audio.AVPlaybackSourceObject | Asset.Asset;
  }) {
    if (params.type === "record") {
      // Audio.Audio.Recording.createAsync(
      //   Audio.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      // )
      //   .then(({ recording, status }) => {
      //     this._recording = recording;
      //     this._recordingStatus = status;
      //   })
      //   .catch();
    } else if (params.type === "playback") {
      if (params.file) {
        Audio.Audio.Sound.createAsync(params.file)
          .then(({ sound, status }) => {
            this._sound = sound;
            this._soundStatus = status;
          })
          .catch();
      }
    }
  }
  async startPlayAudio() {
    if (this._soundStatus?.isLoaded === true) {
      this._sound?.playAsync();
    }
  }
  async stopPlayAudio() {
    this._sound?.stopAsync();
  }

  async startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.Audio.requestPermissionsAsync();
      await Audio.Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording, status } = await Audio.Audio.Recording.createAsync(
        Audio.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      console.log("Recording started");
      this._recording = recording;
      this._recordingStatus = status;
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async stopRecording() {
    console.log("Stopping recording..");
    if (this._recordingStatus?.isRecording === true) {
      await this._recording?.stopAndUnloadAsync();
      await Audio.Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = this._recording?.getURI();
      const ms = this._recordingStatus?.durationMillis; // todo: bug?
      console.log(
        "Recording stopped and stored at",
        uri,
        this._recordingStatus
      );
      this._recording = undefined;
      this._recordingStatus = undefined;
      return { uri, duration: ms };
    }
    return undefined;
  }
}
