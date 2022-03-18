import { app, dialog } from "electron";

export default class ExceptionHandler {
  constructor() {
    this.setup();
  }

  setup() {
    process.on("uncaughtException", (error) => {
      if (!app.isPackaged && app.isReady()) {
        const { message } = error;

        console.error(error);

        dialog.showErrorBox("Error: ", message);
      }
    });
  }
}
