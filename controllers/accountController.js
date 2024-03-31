const Account = require("../models/accountModel");
const User = require("../models/userModel");

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
    const number = user.accounts != 0;
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
      /* User.findById(req.query.iduser)
      .then((user) => {
        if (!user.state) {
          res.status(404);
          res.json({error: "User not found"});
          return;
        }

        const accounts = user.account.filter(
          (account) => account.state == true
        );
        res.json(accounts);
      })
      .catch((err) => {
        res.status(404);
        res.json({error: "Account doesnt exist"});
      }); */

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
  console.log(1);
  if (req.query && req.query.id) {
    // Buscar la cuenta por su ID
    console.log(2);
    Account.findById(req.query.id)
      .then((account) => {
        // Verificar si la cuenta  está activa
        console.log(3);
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }
        console.log(4);
        // Validar la longitud del PIN
        console.log(req.body.pin);
        console.log("?");
        console.log(req.body.pin.toString());
        console.log("?");
        console.log(req.body.pin.toString().length);
        console.log("?");
        const validpin = req.body.pin.toString().length === 6;
        console.log("pin");
        if (!validpin) {
          res.status(422);
          res.json({ error: "Pin must be a 6-digit number" });
          return;
        }
        console.log(5);
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
        console.log(6);
        // Actualizar los campos de la cuenta
        account.full_name = req.body.full_name
          ? req.body.full_name
          : account.full_name;
        account.avatar = req.body.avatar ? req.body.avatar : account.avatar;
        account.age = req.body.age ? req.body.age : account.age;
        account.pin = req.body.pin ? req.body.pin : account.pin;

        console.log(7);
        // Guardar los cambios en la cuenta
        account
          .save()
          .then((data) => {
            console.log(8);
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
        console.log("ya");
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
      .then((account) => {
        // Verificar si la cuenta está activa
        if (!account.state) {
          res.status(404);
          res.json({ error: "Account not found" });
          return;
        }
        // Actualizar el estado de la cuenta a inactivo
        account.state = false;

        // Guardar los cambios en la cuenta

        const user = User.findById(account.user);

        if (!user || !user.state) {
          res.status(404);
          res.json({ error: "User not found" });
          return;
        }
        user.number_accounts++;
        user.save().then(() => {
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
  accountGet,
  accountPost,
  accountPatch,
  accountDelete,
};
