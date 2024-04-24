const Account = require("../models/accountModel");
const Playlist = require("../models/playlistModel");
const User = require("../models/userModel");

/**
 * Creates a account
 *
 * @param {*} req
 * @param {*} res
 */
const addPlaylist = async (req, res) => {
  // Verificar si se proporciona un ID de cuenta
  if (req.query && req.query.id) {
    // Buscar la cuenta por su ID
    Account.findById(req.query.id)
      .then(async (account) => {
        // Verificar si la cuenta  está activa
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }

        // Validar los campos requeridos
        try {
          // Iterar sobre los campos que deseas validar
          console.log(req.body);
          console.log(req.body.playlist);
          if (!req.body.playlist || req.body.playlist.trim() === "") {
            throw new Error(
              `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
            );
          }
          console.log(req.body.playlist);
        } catch (error) {
          res.status(400);
          res.json({ error: error.message });
          return;
        }

        // Validar si existe la playlist
        const playlist = await Playlist.findById(req.body.playlist);
        if (!playlist.state) {
          res.status(404);
          res.json({ error: "Playlist not found" });
          return;
        }

        if (!(account.user.toString() === playlist.user.toString())) {
          res.status(404);
          res.json({ error: "Playlist not found" });
          return;
        }

        // Agrega una playlist nueva
        const lista = account.playlists;
        if (lista.includes(req.body.playlist)) {
          res.status(404);
          res.json({ error: "This playlist is already" });
          return;
        }
        lista.push(req.body.playlist);
        // account.playlists = list;
        // Guardar los cambios en la cuenta
        account
          .save()
          .then((data) => {
            res.status(200); // OK
            res.header({ location: `/api/accounts/?id=${data._id}` });
            res.json(data);
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "There was an error saving the account" });
          });
      })
      .catch(function (err) {
        res.status(404);
        res.json({ error: "Account not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "Account ID is required in query parameters" });
  }
};

/**
 * Creates a account
 *
 * @param {*} req
 * @param {*} res
 */
const deletePlaylist = async (req, res) => {
  // Verificar si se proporciona un ID de cuenta
  if (req.query && req.query.id && req.query.idplaylist) {
    // Buscar la cuenta por su ID
    Account.findById(req.query.id)
      .then(async (account) => {
        // Verificar si la cuenta  está activa
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }

        // Validar si existe la playlist
        const playlist = await Playlist.findById(req.query.idplaylist);
        if (!playlist.state) {
          res.status(404);
          res.json({ error: "Playlist not found" });
          return;
        }

        // Agrega una playlist nueva
        const lista = account.playlists;
        if (!lista.includes(req.query.idplaylist)) {
          res.status(404);
          res.json({ error: "Playlist not found" });
          return;
        }
        const indice = lista.indexOf(req.query.idplaylist);
        lista.splice(indice, 1);
        // account.playlists = list;
        // Guardar los cambios en la cuenta
        account
          .save()
          .then((data) => {
            res.status(200); // OK
            res.header({ location: `/api/accounts/?id=${data._id}` });
            res.json(data);
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "There was an error saving the account" });
          });
      })
      .catch(function (err) {
        res.status(404);
        res.json({ error: "Server error" });
      });
  } else {
    res.status(400);
    res.json({ error: "Account ID is required in query parameters" });
  }
};

/**
 * Creates a account
 *
 * @param {*} req
 * @param {*} res
 */
const accountPost = async (req, res) => {
  try {
    // Crear una nueva instancia de Account
    const account = new Account();

    // Encuentra al usuario por su ID
    const user = await User.findById(req.body.user);

    // Verificar si el usuario existe y está activo
    if (!user || !user.state) {
      res.status(404);
      res.json({ error: "User not found" });
      return;
    }

    // Validar los campos requeridos
    ["full_name", "avatar"].forEach((field) => {
      if (!req.body[field] || req.body[field].trim() === "") {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    });

    // Verificar si el usuario tiene cuentas disponibles y si el PIN es válido
    const number = user.number_accounts != 0;
    const validpin = req.body.pin.toString().length == 6;

    if (validpin && number) {
      // Asignar valores a la cuanta
      account.full_name = req.body.full_name;
      account.pin = req.body.pin;
      account.avatar = req.body.avatar;
      account.user = req.body.user;
      account.age = req.body.age;
      account.state = true;

      user.number_accounts--;

      // Guardar la cuenta y actualizar el usuario
      await account
        .save()
        .then((data) => {
          user
            .save()
            .then(() => {
              res.status(201);
              res.header({ location: `/api/accounts/?id=${data.id}` });
              res.json(data);
            })
            .catch((err) => {
              res.status(500);
              res.json({
                error: "There was an error saving the account",
              });
            });
        })
        .catch((err) => {
          res.status(500);
          res.json({ error: "There was an error saving the account" });
        });
    } else {
      res.status(422);
      res.json({ error: "No valid data provided for account" });
    }
  } catch (error) {
    res.status(500);
    res.json({ error: "There was an error saving the account" });
  }
};

/**
 * Get all accounts
 *
 * @param {*} req
 * @param {*} res
 */
const accountGet = async (req, res) => {
  try {
    // Si se requieren todas las cuentas de un usuario específico por ID de usuario
    if (req.query && req.query.iduser) {
      const user = await User.findById(req.query.iduser);

      if (!user.state) {
        res.status(404);
        res.json({ error: "User not found" });
        return;
      }

      Account.find({ user: req.query.iduser, state: true })
        .then((accounts) => {
          res.status(200);
          res.json(accounts);
        })
        .catch((err) => {
          res.status(404);
          res.json({ error: "Account not found" });
        });
    } else {
      // Si se requiere una cuenta específica por ID
      if (req.query && req.query.id) {
        Account.findById(req.query.id)
          .then((account) => {
            // Verificar si la cuenta  está activa
            if (!account.state) {
              res.status(404);
              res.json({ error: "Account not found" });
              return;
            }
            res.status(200);
            res.json(account);
          })
          .catch((err) => {
            res.status(404);
            res.json({ error: "Account not found" });
          });
      } else {
        // Si no se proporciona ningún parámetro, devolver todas las cuentas activas
        Account.find({ state: true })
          .then((data) => {
            res.status(200);
            res.json(data);
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "Internal server error" });
          });
      }
    }
  } catch (error) {
    res.status(500);
    res.json({ error: "Internal server error" });
  }
};

/**
 * Updates a account
 *
 * @param {*} req
 * @param {*} res
 */
const accountPatch = (req, res) => {
  // Verificar si se proporciona un ID de cuenta
  if (req.query && req.query.id) {
    // Buscar la cuenta por su ID
    Account.findById(req.query.id)
      .then((account) => {
        // Verificar si la cuenta  está activa
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }
        // Validar la longitud del PIN
        const validpin = req.body.pin.toString().length === 6;
        if (!validpin) {
          res.status(422);
          res.json({ error: "Pin must be a 6-digit number" });
          return;
        }
        // Validar los campos requeridos
        try {
          // Iterar sobre los campos que deseas validar
          ["full_name", "avatar"].forEach((field) => {
            if (!req.body[field] || req.body[field].trim() === "") {
              throw new Error(
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
              );
            }
          });
        } catch (error) {
          res.status(400);
          res.json({ error: error.message });
          return;
        }

        // Actualizar los campos de la cuenta
        account.full_name = req.body.full_name
          ? req.body.full_name
          : account.full_name;
        account.avatar = req.body.avatar ? req.body.avatar : account.avatar;
        account.age = req.body.age ? req.body.age : account.age;
        account.pin = req.body.pin ? req.body.pin : account.pin;

        // Guardar los cambios en la cuenta
        account
          .save()
          .then((data) => {
            res.status(200); // OK
            res.header({ location: `/api/accounts/?id=${data._id}` });
            res.json(data);
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "There was an error saving the account" });
          });
      })
      .catch(function (err) {
        res.status(404);
        res.json({ error: "Account not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "Account ID is required in query parameters" });
  }
};

/**
 * Deletes a account
 *
 * @param {*} req
 * @param {*} res
 */
const accountDelete = (req, res) => {
  // Verificar si se proporciona un ID de cuenta
  if (req.query && req.query.id) {
    // Buscar la cuenta por su ID
    Account.findById(req.query.id)
      .then(async (account) => {
        // Verificar si la cuenta está activa
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }
        // Actualizar el estado de la cuenta a inactivo
        account.state = false;

        // Guardar los cambios en la cuenta
        const user = await User.findById(account.user);

        if (!user.state) {
          res.status(404);
          res.json({ error: "User not found" });
          return;
        }
        user.number_accounts++;
        user
          .save()
          .then(() => {
            account
              .save()
              .then(() => {
                res.status(200); //No content
                res.json({});
              })
              .catch((err) => {
                res.status(422);
                res.json({ error: "There was an error deleting the account" });
              });
          })
          .catch((err) => {
            res.status(422);
            res.json({ error: "There was an error deleting the account" });
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "Account not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "Account ID is required in query parameters" });
  }
};

module.exports = {
  addPlaylist,
  deletePlaylist,
  accountGet,
  accountPost,
  accountPatch,
  accountDelete,
};
