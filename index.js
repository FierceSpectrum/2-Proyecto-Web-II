require("dotenv").config();

const accountSid = process.env.TWILIO_AUTH_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const jwt = require("jsonwebtoken");

const User = require("./models/userModel");

const express = require("express");
const app = express();

const { transporter } = require("./config.js");
// const nodemailer = require("nodemailer");
// database connection
const mongoose = require("mongoose");
const db = mongoose.connect("mongodb://127.0.0.1:27017/users2", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const theSecretKey = process.env.JWT_SECRET;

const {
  userVerificad,
  userLogin,
  userPatch,
  userPost,
  userGet,
  userDelete,
} = require("./controllers/userController.js");

const {
  playlistPatch,
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
  deletePlaylist,
  accountPatch,
  accountPost,
  accountGet,
  accountDelete,
} = require("./controllers/accountController.js");

const { avatarCreat, avatarGet } = require("./controllers/avatarController.js");

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
const cors = require("cors");

// Middlewares
app.use(bodyParser.json());
// check for cors
app.use(
  cors({
    domains: "*",
    methods: "*",
  })
);
app.patch("/api/usersVerificad", userVerificad);

app.post("/api/users", (req, res) => {
  userPost(req, res) // Llama a userPost
    .then(async (response) => {
      if (!response) {
        // res.send({});
        return;
      }

      const mailoptions = {
        from: "TubeKidsPro 👻", // sender address
        to: response.email, // list of receivers
        subject: "Confirm Your Account ✔", // Subject line
        text: "Confirm Your Account?", // plain text body
        html: `
        <div style="display: flex; justify-content: center; padding-top: 1rem;">
          <a
            href="http://localhost:3000/ConfirmAccount/${response.id}"
            style="background-color: rgb(20, 129, 255); color: #ffffff; padding: 10px; border-radius: 10px; text-decoration: none; font-size: 1.2rem;"
            onmouseover="this.style.backgroundColor='#0362ce'; this.style.color='#b1b1b1'"
            onmouseout="this.style.backgroundColor='rgb(20, 129, 255)'; this.style.color='#ffffff'"
          >
            Confirma tu cuenta aquí
          </a>
        </div>
        `, // html body
      };
      await transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          console.log("error");
          console.log(error);
        } else {
          console.log("info");
          console.log(info);
        }
      });
      console.log("exito?");
    })
    .catch((error) => {
      // Manejo de errores si userPost falla
      console.error("Hubo un error en la operación de usuario:", error);
      // Envía una respuesta de error al cliente si es necesario
      // res.status(500).send("Hubo un error en la operación de usuario.");
    });
});

// login with JWT
app.post("/api/session", function (req, res) {
  User.find({ state: true })
    .then(async (users) => {
      const user = users.filter(
        (user) =>
          user.email === req.body.email && user.password === req.body.password
      );
      if (!user) {
        res.status(422);
        res.json({ error: "Invalid username or password" });
        return;
      }
      const data = user[0];
      console.log("sms");
      console.log(data.phone);
      const verifySid = "VAd89e087717851f2c9ad73df2a98c36e1";
      await client.verify.v2
        .services(verifySid)
        .verifications.create({
          body: "TubeKids Pro",
          to: data.phone,
          channel: "sms",
        })
        .then((verification) => {
          console.log(verification.status);
          return;
        });
      console.log("smsf");
      const dateNow = new Date();
      const dateAfterOneMinute = new Date(dateNow.getTime() + 120000);

      const token = jwt.sign(
        {
          userID: data._id,
          name: data.name,
          permission: ["authentication"],
          expiration: dateAfterOneMinute,
          pin: data.pin,
          phone: data.phone,
          country: data.contry,
          last_name: data.last_name,
        },
        theSecretKey
      );

      res.status(201);
      res.json(token);
    })
    .catch((err) => {
      res.status(500);
      res.json({ "Internal server error": err });
    });
});

app.post("/api/authentication", function (req, res) {
  console.log("si");
  if (req.headers["authorization"]) {
    console.log("he");
    const authToken = req.headers["authorization"].split(" ")[1];
    console.log("token");
    try {
      jwt.verify(authToken, theSecretKey, async (err, decodedToken) => {
        if (err || !decodedToken) {
          res.status(401);
          res.send({
            error: "Unauthorized",
          });
          return;
        }

        const currentDate = new Date();
        const expirationDate = new Date(decodedToken.expiration);
        console.log("time");
        if (
          currentDate.getTime() > expirationDate.getTime() ||
          decodedToken.permission[0] !== "authentication"
        ) {
          res.status(422);
          res.send({
            error: "Unauthorized",
          });
          return;
        }
        console.log("code");
        if (!req.body.code) {
          res.status(404);
          res.json({
            error: "Code is required",
          });
          return;
        }
        try {
          console.log("sms");
          const verifySid = "VAd89e087717851f2c9ad73df2a98c36e1";
          await client.verify.v2
            .services(verifySid)
            .verificationChecks.create({
              to: decodedToken.phone,
              code: req.body.code,
            })
            .then((verification_check) => {
              console.log(verification_check.status);
              if (verification_check.status !== "approved") {
                throw new Error("Invalid code");
              }
            });

          console.log("token2");
          const dateNow = new Date();
          const dateAfterOneMinute = new Date(dateNow.getTime() + 600000);
          decodedToken.expiration = dateAfterOneMinute;
          decodedToken.permission = ["create", "edit", "delete"];
          const token = jwt.sign(decodedToken, theSecretKey);
          console.log("si!");
          res.status(201);
          res.json({ token, user: decodedToken });
          return;
        } catch (error) {
          res.status(404);
          res.json({ error: error });
          return;
        }
      });
    } catch (e) {
      console.error("There was an error", e);
      res.status(401);
      res.send({ error: "Unauthorized" });

      return;
    }
  } else {
    res.status(401);
    res.send({ error: "Unauthorized" });
  }
});

// JWT Authentication middleware
app.use(function (req, res, next) {
  if (req.headers["authorization"]) {
    const authToken = req.headers["authorization"].split(" ")[1];
    try {
      jwt.verify(authToken, theSecretKey, (err, decodedToken) => {
        if (err || !decodedToken) {
          res.status(401);
          res.send({
            error: "Unauthorized",
          });
          return;
        }

        const currentDate = new Date();
        const expirationDate = new Date(decodedToken.expiration);

        if (currentDate.getTime() > expirationDate.getTime()) {
          res.status(401);
          res.send({
            error: "Unauthorized",
          });
          return;
        }
        next();
      });
    } catch (e) {
      console.error("There was an error", e);
      res
        .send({
          error: "Unauthorized ",
        })
        .status(401);
    }
  } else {
    res.status(401);
    res.send({
      error: "Unauthorized ",
    });
  }
});

// listen to the task request

// user
app.post("/api/usersLogin", userLogin);
app.get("/api/users", userGet);
app.patch("/api/users", userPatch);
app.put("/api/users", userPatch);
app.delete("/api/users", userDelete);

// playlist
app.get("/api/playlists", playlistGet);
app.post("/api/playlists", playlistPost);
app.patch("/api/playlists", playlistPatch);
app.put("/api/playlists", playlistPatch);
app.delete("/api/playlists", playlistDelete);

// video
app.get("/api/videos", videoGet);
app.post("/api/videos", videoPost);
app.patch("/api/videos", videoPatch);
app.put("/api/videos", videoPatch);
app.delete("/api/videos", videoDelete);

// account
app.patch("/api/accountsPlaylist", addPlaylist);
app.delete("/api/accountsPlaylist", deletePlaylist);
app.get("/api/accounts", accountGet);
app.post("/api/accounts", accountPost);
app.patch("/api/accounts", accountPatch);
app.put("/api/accounts", accountPatch);
app.delete("/api/accounts", accountDelete);

// avatar
app.post("/api/Creatavatars", avatarCreat);
app.get("/api/avatars", avatarGet);

app.listen(3002, () => console.log(`Example app listening on port 3002!`));
