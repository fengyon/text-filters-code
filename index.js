const { app, BrowserWindow } = require("electron");
// const http = require('http')
// const sever = http.createServer((req,res)=>{
//   res.write()
// })
// sever.listen()
const pkg = require("./package.json");
import "core-js/es5";
function createWindow() {
  const win = new BrowserWindow({
    width: 1022,
    height: 670,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (!pkg.production) {
    win.webContents.openDevTools();
    win.loadURL("http://localhost:8000/");
  } else {
    win.loadURL("./dist/index.html");
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
