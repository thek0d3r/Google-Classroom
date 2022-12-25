const { app, BrowserWindow, ipcMain, Menu, Notification, nativeTheme, nativeImage } = require("electron");
const path = require("path");

app.setAppUserModelId("Google Classroom");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

// Check for internet connection;

let checkConnectionWindow;

app.whenReady().then(() => {
  checkConnectionWindow = new BrowserWindow({ width: 0, height: 0, show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
  checkConnectionWindow.loadFile(path.join(__dirname, "html/checkConnection.html"));
});

ipcMain.on("update-online-connection", async (event, status) => {
  createWindow(status);
  checkConnectionWindow.destroy();
});

// Menu Bar

const isMac = process.platform === "darwin";
const MenuTemplate = [
  ...(isMac ? [{
    label: app.name,
  }] : []),
  {
    label: app.name,
    submenu: [
      { role: "minimize" },
      { role: "togglefullscreen" },
      isMac ? { role: "close" } : { role: "quit" }
    ]
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" }
      ] : [
          { role: "delete" },
          { type: "separator" },
          { role: "selectAll" }
      ])
    ]
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Help",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://support.google.com/edu/classroom/?hl=en#topic=10298088");
        }
      },
    ]
  }
];

// Create the main window

const createWindow = (status) => {
  // Create the browser window.
  nativeTheme.themeSource = "light";
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: "#fff",
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true
    },
    icon: path.join(__dirname, "images/classroom.ico")
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });


  // Load in the menu bar

  const menu = Menu.buildFromTemplate(MenuTemplate);
  Menu.setApplicationMenu(menu);

  if (status === "online") {
    // and load the index.html of the app
    mainWindow.loadURL("https://classroom.google.com/signin/");
      if(!isMac) {
        mainWindow.setThumbarButtons([
          {
            tooltip: "Classes",
            icon: nativeImage.createFromPath(path.join(__dirname, "images/Classes.png")),
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/h");
              mainWindow.show();
            }
          },
          {
            tooltip: "To Do",
            icon: nativeImage.createFromPath(path.join(__dirname, "images/ToDo.png")),
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/a/not-turned-in/all");
              mainWindow.show();
            }
          },
          {
            tooltip: "Calendar",
            icon: nativeImage.createFromPath(path.join(__dirname, "images/Calendar.png")),
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/calendar/this-week/course/all");
              mainWindow.show();
            }
          }
        ]);
      } else {
        app.dock.setMenu(Menu.buildFromTemplate([
          {
            label: "Classes",
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/h");
              mainWindow.show();
            }
          },
          {
            label: "To Do",
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/a/not-turned-in/all");
              mainWindow.show();
            }
          },
          {
            label: "Calendar",
            click() {
              mainWindow.loadURL("https://classroom.google.com/u/0/calendar/this-week/course/all");
              mainWindow.show();
            }
          }
        ]))
      }
  } else {
    mainWindow.loadFile(path.join(__dirname, "html/offline.html")).then(() => { showNotification("Offline", "You are offline. Check your internet connection!"); });
    setTimeout(() => {
      app.relaunch();
      app.quit();
    }, 10000);
}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs;

// app.on("ready", () => {
//   setTimeout(() => {
//     createWindow();
//   }, 1000);
// });

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and import them here.

function showNotification(title, body) {
  const notification = {
    icon: path.join(__dirname, "images/classroom.ico"),
    title: title,
    body: body
  }
  new Notification(notification).show();
}