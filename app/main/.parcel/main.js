process.env.HMR_PORT=50570;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"classes/label.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Label {
  constructor(key, name, colour) {
    this.key = key;
    this.name = name;
    this.colour = colour;
  }

}

exports.default = Label;
},{}],"api/label.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteLabel = exports.recolourLabel = exports.renameLabel = exports.createLabel = exports.getLabel = exports.getLabels = void 0;

const label_1 = require("../classes/label");

exports.getLabels = (obj, ctx) => {
  return ctx.db.all("SELECT key, name, colour FROM label").then(result => result.map(r => new label_1.Label(r.key, r.name, r.colour)));
}; // TODO: Not sure why this is an object for key


exports.getLabel = (key, ctx) => {
  return ctx.db.get("SELECT key, name, colour FROM label WHERE key = $key", {
    $key: key.key
  }).then(result => {
    return new label_1.Label(result.key, result.name, result.colour);
  });
};

exports.createLabel = (label, ctx) => {
  return ctx.db.run("INSERT INTO label (key, name, colour ) VALUES (?, ?, ?)", label.key, label.name, label.colour).then(result => {
    return result.changes ? exports.getLabel({
      key: label.key
    }, ctx) : new Error("Unable to create label");
  });
};

exports.renameLabel = (label, ctx) => {
  return ctx.db.run(`UPDATE label SET name = $name WHERE key = $key`, {
    $key: label.key,
    $name: label.name
  }).then(result => {
    return result.changes ? exports.getLabel({
      key: label.key
    }, ctx) : new Error("Unable to rename label");
  });
};

exports.recolourLabel = (label, ctx) => {
  return ctx.db.run("UPDATE label SET colour = $colour WHERE key = $key", {
    $key: label.key,
    $colour: label.colour
  }).then(result => {
    return result.changes ? exports.getLabel({
      key: label.key
    }, ctx) : new Error("Unable to recolour label");
  });
};

exports.deleteLabel = (input, ctx) => {
  return ctx.db.run("DELETE FROM label WHERE key = $key", {
    $key: input.key
  }).then(result => {
    return result.changes ? input.key : new Error(`Unable to delete label with key ${input.key}`);
  });
};
},{"../classes/label":"classes/label.ts"}],"classes/feature.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Feature {
  constructor(key, name, enabled) {
    this.key = key;
    this.name = name;
    this.enabled = enabled;
  }

}

exports.default = Feature;
},{}],"api/feature.ts":[function(require,module,exports) {
"use strict";

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFeature = exports.setFeature = exports.getFeature = exports.getFeatures = void 0;

const feature_1 = __importDefault(require("../classes/feature"));

exports.getFeatures = (obj, ctx) => {
  return ctx.db.all("SELECT key, name, enabled FROM feature").then(result => result.map(r => new feature_1.default(r.key, r.name, r.enabled)));
};

exports.getFeature = (key, ctx) => {
  return ctx.db.get("SELECT key, name, enabled FROM feature WHERE key = $key", {
    $key: key.key
  }).then(result => {
    return new feature_1.default(result.key, result.name, result.enabled);
  });
};

exports.setFeature = (data, ctx) => {
  return ctx.db.run("UPDATE feature SET enabled = $enabled WHERE key = $key", {
    $enabled: data.enabled,
    $key: data.key
  }).then(result => {
    return result.changes ? exports.getFeature({
      key: data.key
    }, ctx) : new Error("Unable to create feature");
  });
};

exports.createFeature = (feature, ctx) => {
  return ctx.db.run("INSERT INTO feature (key, name, enabled) VALUES (?, ?, ?)", feature.key, feature.name, feature.enabled).then(result => {
    return result.changes ? exports.getFeature({
      key: feature.key
    }, ctx) : new Error("Unable to create feature");
  });
};
},{"../classes/feature":"classes/feature.ts"}],"schemas/schema.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rootValue = exports.schema = void 0;

const graphql_1 = require("graphql");

const label_1 = require("../api/label");

const feature_1 = require("../api/feature"); // TODO: Work out where / how to store ordering


exports.schema = graphql_1.buildSchema(`
  type Label {
    key: String!,
    name: String,
    colour: String,
  }

  type Calendar {
    key: String!,
    name: String,
  }

  type Feature {
    key: String!,
    name: String!,
    enabled: Boolean,
  }

  type Reminder {
    key: String!,
    text: String,
    deleted: Boolean,
    remindAt: String,
    item: Item 
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
  }

  type Event {
    key: String!,
    title: String,
    start: String,
    end: String,
    description: String,
    allDay: Boolean,
    calendar: Calendar,
  }

  type Area {
    key: String!,
    name: String,
    deleted: Boolean,
    description: String,
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
  }

  type Project {
    key: String!,
    name: String,
    deleted:  Boolean,
    description: String,
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
    startAt: String,
    endAt: String,
    area: Area,
  }

  type Item {
    key: String!,
    type: String, 
    text: String,
    deleted: Boolean,
    completed: Boolean
    parent: Item,
    project: Project, 
    dueDate: String,
    scheduledDate: String,
    lastUpdatedAt: String,
    completedAt: String,
    createdAt: String,
    deletedAt: String,
    repeat: String,
    label: Label, 
    area: Area,
  }


  input LabelInput {
    key: String!,
    name: String!,
    colour: String!
  }

  input RenameLabelInput {
   key: String!,
   name: String!
 }
  input RecolourLabelInput {
   key: String!,
   colour: String!
}

  input DeleteLabelInput {
   key: String!
  }

  input FeatureInput{
    key: String!,
    name: String!,
    enabled: Boolean!
  }
  input SetFeatureInput{
    key: String!,
    enabled: Boolean!
  }

type Query {
    labels: [Label],
    label(key: String!): Label,
    features: [Feature],
    feature(key: String!): Feature
  }

type Mutation {
    createLabel(input: LabelInput!) : Label,
    renameLabel(input: RenameLabelInput!) : Label,
    recolourLabel(input: RecolourLabelInput!) : Label,
    deleteLabel(input: DeleteLabelInput!): String,
    createFeature(input: FeatureInput!) : Feature,
    setFeature(input: SetFeatureInput!) : Feature,
}

`);
exports.rootValue = {
  labels: (obj, ctx) => {
    return label_1.getLabels(obj, ctx);
  },
  label: (key, ctx) => {
    return label_1.getLabel(key, ctx);
  },
  createLabel: ({
    input
  }, ctx) => {
    return label_1.createLabel(input, ctx);
  },
  renameLabel: ({
    input
  }, ctx) => {
    return label_1.renameLabel(input, ctx);
  },
  recolourLabel: ({
    input
  }, ctx) => {
    return label_1.recolourLabel(input, ctx);
  },
  deleteLabel: ({
    input
  }, ctx) => {
    return label_1.deleteLabel(input, ctx);
  },
  feature: (key, ctx) => {
    return feature_1.getFeature(key, ctx);
  },
  features: (obj, ctx) => {
    return feature_1.getFeatures(obj, ctx);
  },
  createFeature: ({
    input
  }, ctx) => {
    return feature_1.createFeature(input, ctx);
  },
  setFeature: ({
    input
  }, ctx) => {
    return feature_1.setFeature(input, ctx);
  }
};
},{"../api/label":"api/label.ts","../api/feature":"api/feature.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

var __createBinding = void 0 && (void 0).__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = void 0 && (void 0).__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
};

var __importDefault = void 0 && (void 0).__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const electron_1 = require("electron");

const isDev = __importStar(require("electron-is-dev"));

const path = __importStar(require("path"));

const applescript_1 = __importDefault(require("applescript"));

const semver = __importStar(require("semver"));

const express_1 = __importDefault(require("express"));

const express_graphql_1 = require("express-graphql");

const schema_1 = require("./schemas/schema");

const sqlite = __importStar(require("sqlite"));

const sqlite3 = __importStar(require("sqlite3"));

const GRAPHQL_PORT = 8080;

(async () => {
  const db = await sqlite.open({
    filename: "./database.db",
    driver: sqlite3.Database
  });
  await db.run("PRAGMA foreign_keys=on");
  await db.migrate({
    migrationsPath: path.join(process.cwd(), "/app/main/migrations")
  });
  const graphQLApp = await express_1.default(); // Enable cors

  graphQLApp.use("/graphql", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  graphQLApp.use("/graphql", express_graphql_1.graphqlHTTP({
    rootValue: schema_1.rootValue,
    graphiql: true,
    pretty: true,
    schema: schema_1.schema,
    customFormatErrorFn: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack ? error.stack.split("\n") : [],
      path: error.path
    }),
    context: {
      db: {
        get: (...args) => db.get(...args),
        all: (...args) => db.all(...args),
        run: (...args) => db.run(...args)
      }
    }
  }));
  const graphQLServer = await graphQLApp.listen(GRAPHQL_PORT, () => {
    console.log(`GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`);
  });
})();

let mainWindow, quickAddWindow;
let calendar = "";

const getMailLink = () => {
  const script = `
    tell application "Mail"
		set theSelection to selection
		set theMessage to item 1 of theSelection
		set theSubject to subject of theMessage
		set theSender to sender of theMessage
		set theID to message id of theMessage
		set theLink to "message://%3c" & theID & "%3e"
        set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
        set the clipboard to theItem
		return theItem
	end tell
`;
  applescript_1.default.execString(script, (err, rtn) => {
    if (err) {
      console.log(err);
    }

    mainWindow.webContents.send("create-task", {
      text: rtn,
      source: "Apple Mail"
    });
  });
};

const getCalendars = () => {
  const script = `
	    tell application "Calendar"
	        return name of calendars
        end tell
`;
  applescript_1.default.execString(script, (err, cals) => {
    if (err) {
      console.log(err);
    }

    mainWindow.webContents.send("calendars", cals);
  });
};

const getCalendarEvents = calendarName => {
  const script = `
        set theStartDate to current date
        set hours of theStartDate to 0
        set minutes of theStartDate to 0
        set seconds of theStartDate to 0
        set theEndDate to theStartDate + (7 * days) - 1
        set output to {}
        tell application "Calendar"
            tell calendar "${calendarName}"
                set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than theEndDate)
                repeat with e in allEvents
                    set startDate to (start date of e)
                    set endDate to (end date of e)
                    copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (description of e), (status of e), (time to GMT)/hours} to end of output
                end repeat
            end tell
        end tell
        return output
        `;
  applescript_1.default.execString(script, (err, rtn) => {
    if (err) {
      console.log(err);
    }

    const headers = ["id", "startDate", "startTime", "endDate", "endTime", "summary", "description", "status", "tzOffset"];
    const events = Object.values(rtn).map(r => {
      return r.reduce((acc, cur, index) => {
        acc[headers[index]] = cur;
        return acc;
      }, {});
    });
    console.log(`Sending events back to FE`);
    mainWindow.webContents.send("events", events);
  });
};

const getOutlookLink = () => {
  const script = `
    tell application "Microsoft Outlook"
    set theSelection to selection
    set theMessage to item 1 of theSelection
    set theSubject to subject of theMessage
    set theSender to sender of theMessage
    set theID to message id of theMessage
    set theLink to "outlook://" & theID
    set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
    set the clipboard to theItem
    return theItem
end tell
`;
  applescript_1.default.execString(script, (err, rtn) => {
    if (err) {
      console.log(err);
    }
  });
};

const openOutlookLink = url => {
  const script = `
	set the messageId to text 11 thru -1 of ${url}
	tell application "Microsoft Outlook"
        open message id messageId
        activate
	end tell
`;
  applescript_1.default.execString(script, (err, rtn) => {
    if (err) {
      console.log(err);
    }
  });
};

const checkForNewVersion = () => {
  const releasesURL = " https://api.github.com/repos/ryankscott/finish-em/releases";
  const request = electron_1.net.request(releasesURL);
  request.on("response", response => {
    let rawData = "";
    response.on("data", chunk => {
      rawData += chunk;
    });
    response.on("end", () => {
      try {
        const response = JSON.parse(rawData); // Get rid of draft versions and prereleases and get the last published

        const sortedReleases = response.filter(r => r.draft == false).filter(r => r.prerelease == false).sort((a, b) => b.published_at - a.published_at); // Get the semver of the release

        const latestRelease = sortedReleases[0]; // If there's a new version

        if (semver.gt(latestRelease.name, electron_1.app.getVersion())) {
          const macRelease = latestRelease.assets.find(a => a.name.endsWith(".dmg")); // Send an event to the front-end to push a notification

          mainWindow.webContents.send("new-version", {
            version: latestRelease.name,
            publishedAt: latestRelease.published_at,
            downloadUrl: macRelease.browser_download_url,
            releaseURL: latestRelease.html_url,
            releaseNotes: latestRelease.body
          });
        }
      } catch (e) {
        console.error(e.message);
      }
    });
  });
  request.on("error", error => {
    setTimeout(checkForNewVersion, 60 * 60 * 1000);
  });
  request.end();
};

function createQuickAddWindow() {
  if (quickAddWindow) return;
  quickAddWindow = new electron_1.BrowserWindow({
    width: 580,
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(process.cwd() + "/app/main/preload.ts"),
      enableRemoteModule: true
    }
  });
  quickAddWindow.loadURL(isDev ? "http://localhost:1234?quickAdd" : `file://${__dirname}/build/index.html?quickAdd`); // Open dev tools
  // quickAddWindow.webContents.openDevTools()
  // On closing derefernce

  quickAddWindow.on("closed", () => {
    quickAddWindow = null;
  });
}

function createMainWindow() {
  // Create the browser window.
  console.log(path.join(process.cwd() + "/app/main/preload.ts"));
  mainWindow = new electron_1.BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 550,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(process.cwd() + "/app/main/preload.ts"),
      enableRemoteModule: true
    }
  }); // Load the index.html of the app.

  mainWindow.loadURL(isDev ? "http://localhost:1124?main" : `file://${__dirname}/build/index.html?main`); // Open dev tools
  // mainWindow.webContents.openDevTools();
  // On closing derefernce
  // TODO: Change to an array for multi-window support

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const handleRedirect = (e, url) => {
    if (url != mainWindow.getURL()) {
      e.preventDefault();

      require("electron").shell.openExternal(url);
    }
  };

  mainWindow.webContents.on("will-navigate", handleRedirect);
  mainWindow.webContents.on("new-window", handleRedirect);
}

electron_1.app.on("ready", () => {
  createMainWindow();
  electron_1.globalShortcut.register("Command+Shift+N", createQuickAddWindow);
  electron_1.globalShortcut.register("Command+Shift+A", getMailLink);
  electron_1.globalShortcut.register("Command+Shift+O", getOutlookLink);

  try {
    checkForNewVersion();
  } catch (e) {
    console.error(`Failed to get new version, trying again in 1hr: ${e}`);
    setTimeout(checkForNewVersion, 1000 * 60 * 60 * 24);
  } // setTimeout(() => {
  //     const myNotification = new Notification('Foo', {
  //         body: 'Lorem Ipsum Dolor Sit Amet',
  //     })
  //     myNotification.show()
  // }, 1000 * 5)
  // Get the features enabled in the UI and do any conditional stuff


  setTimeout(() => {
    mainWindow.webContents.send("get-features");
    electron_1.ipcMain.once("get-features-reply", (event, features) => {
      if (features.calendarIntegration) {
        if (calendar) {
          console.log(`Getting calendar events for ${calendar}`);
          setInterval(getCalendarEvents(calendar), 1000 * 60 * 30);
        }
      }
    });
  }, 1000 * 5);
}); // Quit when all windows are closed.

electron_1.app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    electron_1.app.quit();
  }

  electron_1.globalShortcut.unregisterAll();
});
electron_1.app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});
electron_1.ipcMain.on("close-quickadd", (event, arg) => {
  if (quickAddWindow) {
    quickAddWindow.close();
  }
});
electron_1.ipcMain.on("get-calendars", (event, arg) => {
  const allCalendars = getCalendars();
  mainWindow.webContents.send("calendars", allCalendars);
});
electron_1.ipcMain.on("open-outlook-link", (event, arg) => {
  openOutlookLink(arg.url);
}); // This is to send events between quick add and main window

electron_1.ipcMain.on("create-task", (event, arg) => {
  mainWindow.webContents.send("create-task", arg);
});
electron_1.ipcMain.on("set-calendar", (event, cal) => {
  console.log(`Setting calendar to: ${cal}`);
  calendar = cal;
  getCalendarEvents(calendar);
});
},{"./schemas/schema":"schemas/schema.ts"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = process.env.HMR_HOSTNAME || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + process.env.HMR_PORT + '/');
  ws.onmessage = function(event) {
    checkedAssets = {};
    assetsToAccept = [];

    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function(asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function(asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();

        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });

        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) { // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = (
    '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' +
      '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' +
      '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' +
      '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' +
      '<pre>' + stackTrace.innerHTML + '</pre>' +
    '</div>'
  );

  return overlay;

}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;

  var cached = bundle.cache[id];

  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id)
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}

},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.js.map