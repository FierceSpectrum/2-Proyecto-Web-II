const User = require("../models/userModel");

const validarEmail = (email) => {
  // Expresión regular para validar un correo electrónico
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */

const userLogin = async (req, res) => {
  // Obtener todos los usuarios activos
  User.find({state: true})
    .then((users) => {
      const user = users.filter(
        (user) =>
          user.email === req.body.email && user.password === req.body.password
      );

      if (!user) {
        res.status(404);
        res.json({error: "User not found"});
        return;
      }
      res.status(201);
      res.json(user);
    })
    .catch((err) => {
      res.status(500);
      res.json({"Internal server error": err});
    });
};

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */

const userPost = async (req, res) => {
  const user = new User();

  try {
    // Iterar sobre los campos que deseas validar
    ["password", "name", "last_name", "country"].forEach((field) => {
      if (!req.body[field] || req.body[field].trim() === "") {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    });

    // Validar formato de correo electrónico
    const validemail = validarEmail(req.body.email);
    if (!validemail) {
      throw new Error("Invalid email format");
    }

    // Validar longitud del pin
    const validpin = req.body.pin.toString().length == 6;
    if (!validpin) {
      throw new Error("Pin must be a 6-digit number");
    }

    // Validar edad mínima de 18 años
    const birthdate = new Date(req.body.birthdate);
    if (isNaN(birthdate) || calculateAge(birthdate) < 18) {
      throw new Error("User must be at least 18 years old");
    }

    // Verificar si el correo electrónico ya está en uso
    const usedemail = await User.findOne({email: req.body.email});
    if (usedemail) {
      throw new Error("Email is already in use");
    }

    // Asignar valores al usuario
    user.email = req.body.email;
    user.password = req.body.password;
    user.pin = req.body.pin;
    user.name = req.body.name;
    user.last_name = req.body.last_name;
    user.country = req.body.country;
    user.birthdate = req.body.birthdate;
    user.number_accounts = 6;
    user.number_playlists = 1;
    user.state = true;

    // Guardar usuario en la base de datos
    await user
      .save()
      .then((data) => {
        res.status(201); // CREATED
        res.header({location: `/api/users/?id=${data.id}`});
        res.json(data);
      })
      .catch((err) => {
        res.status(500);
        console.log("error while saving the user", err);
        res.json({error: error.message});
      });
  } catch (error) {
    res.status(404);
    res.json({error: error.message});
  }
};

// Función para calcular la edad
function calculateAge(birthdate) {
  const today = new Date();
  const diff = today - birthdate;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/**
 * Get all users
 *
 * @param {*} req
 * @param {*} res
 */
const userGet = (req, res) => {
  // Si se requiere un usuario específico
  if (req.query && req.query.id) {
    // Encuentra al usuario por su ID
    User.findById(req.query.id)
      .then((user) => {
        // Valida si el usuario esta activo
        if (!user.state) {
          res.status(404);
          res.json({error: "User not found"});
          return;
        }
        res.status(200);
        res.json(user);
      })
      .catch((err) => {
        res.status(500);
        res.json({error: "Internal server error"});
      });
  } else {
    // Obtener todos los usuarios activos
    User.find({state: true})
      .then((users) => {
        // const usersfilter = users.filter(user => user.state)
        res.status(200);
        res.json(users);
      })
      .catch((err) => {
        res.status(500);
        res.json({"Internal server error": err});
      });
  }
};

/**
 * Updates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPatch = (req, res) => {
  // Verifica si se proporciona un ID de usuario en la consulta
  if (req.query && req.query.id) {
    // Busca el usuario por ID
    User.findById(req.query.id)
      .then((user) => {
        if (!user.state) {
          res.status(404);
          res.json({error: "User not found"});
          return;
        }

        // Valida la longitud del pin
        const validpin = req.body.pin.toString().length == 6;
        if (!validpin) {
          res.status(422);
          res.json({
            error: "Invalid pin format. Pin must be a 6-digit number",
          });
          return;
        }

        // Valida la fecha de nacimiento
        const birthdate = new Date(req.body.birthdate);

        if (isNaN(birthdate)) {
          res.status(422);
          res.json({
            error: "Invalid birthdate format. Please provide a valid date",
          });
          return;
        }

        // Valida la edad del usuario
        const today = new Date();
        const operador =
          today.getMonth() < birthdate.getMonth() ||
          (today.getMonth() === birthdate.getMonth() &&
            today.getDate() < birthdate.getDate());
        const age =
          18 <=
          today.getFullYear() - birthdate.getFullYear() - (operador ? 1 : 0);
        if (!age) {
          res.status(422);
          res.json({error: "Users must be at least 18 years old"});
          return;
        }

        try {
          // Iterar sobre los campos que deseas validar
          ["password", "name", "last_name", "country"].forEach((field) => {
            if (!req.body[field] || req.body[field].trim() === "") {
              throw new Error(
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
              );
            }
          });
        } catch (error) {
          res.status(400);
          res.json({error: error.message});
          return;
        }

        // Actualiza los campos del usuario
        user.password = req.body.password ? req.body.password : user.password;
        user.pin = req.body.pin ? req.body.pin : user.pin;
        user.name = req.body.name ? req.body.name : user.name;
        user.last_name = req.body.last_name
          ? req.body.last_name
          : user.last_name;
        user.country = req.body.country ? req.body.country : user.country;
        user.birthdate = req.body.birthdate ? req.body.birthdate : birthdate;
        user.accounts = req.body.accounts ? req.body.accounts : user.accounts;
        user.playlists = req.body.playlists
          ? req.body.playlists
          : user.playlists;

        // Guarda los cambios del usuario
        user
          .save()
          .then((updatedUser) => {
            res.status(200); // OK
            res.json(updatedUser);
          })
          .catch((err) => {
            res.status(500);
            res.json({error: "Internal server error"});
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({error: "User not found"});
      });
  } else {
    res.status(400);
    res.json({error: "User ID is required in query parameters"});
  }
};

/**
 * Deletes a user
 *
 * @param {*} req
 * @param {*} res
 */
const userDelete = (req, res) => {
  // Verifica si se proporciona un ID de usuario en la consulta
  if (req.query && req.query.id) {
    // Busca el usuario por ID
    User.findById(req.query.id)
      .then((user) => {
        if (!user.state) {
          res.status(404);
          res.json({error: "User not found"});
          return;
        }

        // Actualiza el estado del usuario a inactivo
        user.state = false;

        // Guarda los cambios en el usuario
        user
          .save()
          .then(() => {
            res.status(204); //No content
            res.json({});
          })
          .catch((err) => {
            res.status(500);
            res.json({error: "Internal server error"});
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({error: "User not found"});
      });
  } else {
    res.status(400);
    res.json({error: "User ID is required in query parameters"});
  }
};

module.exports = {
  userLogin,
  userGet,
  userPost,
  userPatch,
  userDelete,
};
