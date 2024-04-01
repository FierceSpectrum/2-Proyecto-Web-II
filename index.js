const express = require("express");
const app = express();
// database connection
const mongoose = require("mongoose");
const db = mongoose.connect("mongodb://127.0.0.1:27017/users2", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const {
  userVerificad,
  userLogin,
  userPatch,
  userPost,
  userGet,
  userDelete,
} = require("./controllers/userController.js");

const {
  // playlistPatch,
  playlistPost,
  playlistGet,
  playlistDelete,
} = require("./controllers/playlistController.js");

const {
  videoPatch,
  videoPost,
  videoGet,
  videoDelete,
} = require("./controllers/videoController.js");

const {
  addPlaylist,
  accountPatch,
  accountPost,
  accountGet,
  accountDelete,
} = require("./controllers/accountController.js");

const { avatarCreat, avatarGet } = require("./controllers/avatarController.js");

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// check for cors
const cors = require("cors");
app.use(
  cors({
    domains: "*",
    methods: "*",
  })
);

// listen to the task request

// user
app.patch("/api/usersVerificad", userVerificad);
app.post("/api/usersLogin", userLogin);
app.get("/api/users", userGet);
app.post("/api/users", userPost);
app.patch("/api/users", userPatch);
app.put("/api/users", userPatch);
app.delete("/api/users", userDelete);

// playlist
app.get("/api/playlists", playlistGet);
app.post("/api/playlists", playlistPost);
// app.patch("/api/playlists", playlistPatch);
// app.put("/api/playlists", playlistPatch);
app.delete("/api/playlists", playlistDelete);

// video
app.get("/api/videos", videoGet);
app.post("/api/videos", videoPost);
app.patch("/api/videos", videoPatch);
app.put("/api/videos", videoPatch);
app.delete("/api/videos", videoDelete);

// account
app.patch("/api/accountsPlaylist", addPlaylist);
app.get("/api/accounts", accountGet);
app.post("/api/accounts", accountPost);
app.patch("/api/accounts", accountPatch);
app.put("/api/accounts", accountPatch);
app.delete("/api/accounts", accountDelete);

// avatar
app.post("/api/Creatavatars", avatarCreat);
app.get("/api/avatars", avatarGet);

app.listen(3002, () => console.log(`Example app listening on port 3002!`));
