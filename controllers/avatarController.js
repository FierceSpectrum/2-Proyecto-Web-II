const Avatar = require("../models/avatarModel");

const validarimagen = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false; // La solicitud no fue exitosa, la URL probablemente no es válida
    }

    // Verificar si el contenido de la respuesta es una imagen
    const contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image");
  } catch (error) {
    return false; // Error al realizar la solicitud, la URL probablemente no es válida
  }
};

/**
 * Create avatars
 *
 * @param {*} req
 * @param {*} res
 */

const avatarCreat = async (req, res) => {
  try {
    ["today"].forEach((field) => {
      if (!req.body[field] || req.body[field].trim() === "") {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    });

    const date = new Date(req.body.today);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!(date.getTime() === today.getTime())) {
      req.jeson({ error: "Avatars were not created" });
      return;
    }
    const urlimage = "https://dummyjson.com/users?limit=0&select=image";
    fetch(urlimage, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        data.users.forEach((element) => {
          const url = element.image.replace("set4", "set1");
          const isvalid = validarimagen(url);
          if (!isvalid) {
            throw new Error("Url is invalid");
          }
          const avatar = new Avatar();
          avatar.url = url;
          avatar.save();
        });
        res.status(201);
        res.header({ location: `/api/avatars` });
        res.json(data);
      })
      .catch((error) => {
        res.status(400);
        res.json({ error: "Avatars were not created" });
      });

  } catch (error) {
    res.status(400);
    res.json({ error: error.message });
  }
};

/**
 * Creates a avatar
 *
 * @param {*} req
 * @param {*} res
 */

const avatarPost = async (req, res) => {
  const avatar = new Avatar();
  try {
    // Iterar sobre los campos que deseas validar
    ["url"].forEach((field) => {
      if (!req.body[field] || req.body[field].trim() === "") {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    });
    // Validar la url de la imagen
    const url = req.body.url;
    const isvalid = await validarimagen(url);
    if (!isvalid) {
      throw new Error("Url is invalid");
    }
    // Asignar valores al usuario
    avatar.url = req.body.url;
    // Guardar usuario en la base de datos
    await avatar
      .save()
      .then((data) => {
        res.status(201); // CREATED
        res.header({ location: `/api/avatars/?id=${data.id}` });
        res.json(data);
      })
      .catch((err) => {
        res.status(400);
        console.log("error while saving the avatar", err);
        res.json({ error: error.message });
      });
  } catch (error) {
    res.status(400);
    res.json({ error: error.message });
  }
};

/**
 * Get all avatars
 *
 * @param {*} req
 * @param {*} res
 */
const avatarGet = (req, res) => {
  // Si se requiere una imagen en específico
  if (req.query && req.query.id) {
    // Encuentra la imagen por su ID
    Avatar.findById(req.query.id)
      .then((avatar) => {
        // Valida si hay una imagen
        if (!avatar) {
          res.status(404);
          res.json({ error: "avatar not found" });
          return;
        }
        res.status(200);
        res.json(avatar);
      })
      .catch((err) => {
        res.status(500);
        res.json({ error: "Internal server error" });
      });
  } else {
    // Obtener todos las imagenes
    Avatar.find()
      .then((avatars) => {
        res.status(200);
        res.json(avatars);
      })
      .catch((err) => {
        res.status(500);
        res.json({ "Internal server error": err });
      });
  }
};

/**
 * Updates a avatar
 *
 * @param {*} req
 * @param {*} res
 */
const avatarPatch = (req, res) => {
  // Verifica si se proporciona un ID de la imagen
  if (req.query && req.query.id) {
    // Busca la imagen por ID
    Avatar.findById(req.query.id)
      .then((avatar) => {
        if (!avatar) {
          res.status(404);
          res.json({ error: "avatar not found" });
          return;
        }

        try {
          // Validar la url de la imagen
          const url = new Date(req.body.url);
          if (!validarimagen(url)) {
            throw new Error("Url is invalid");
          }

          // Iterar sobre los campos que desea validar
          ["url"].forEach((field) => {
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

        // Actualiza los campos de la imagen
        avatar.url = req.body.url ? req.body.url : avatar.url;

        // Guarda los cambios de la imagen
        Avatar.save()
          .then((updatedavatar) => {
            res.status(200); // OK
            res.json(updatedavatar);
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "Internal server error" });
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "Avatar not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "Avatar ID is required in query parameters" });
  }
};

/**
 * Deletes a avatar
 *
 * @param {*} req
 * @param {*} res
 */
const avatarDelete = (req, res) => {
  // Verifica si se proporciona un ID de la imagen en la consulta
  if (req.query && req.query.id) {
    // Busca la imagen por ID
    Avatar.findById(req.query.id)
      .then((avatar) => {
        if (!avatar.state) {
          res.status(404);
          res.json({ error: "avatar not found" });
          return;
        }

        // Elimina la imagen
        avatar
          .deleteOne()
          .then(() => {
            res.status(204); //No content
            res.json({});
          })
          .catch((err) => {
            res.status(500);
            res.json({ error: "Internal server error" });
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "avatar not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "avatar ID is required in query parameters" });
  }
};

module.exports = {
  avatarCreat,
  avatarGet
};
