const Playlist = require("../models/playlistModel");
const Video = require("../models/videoModel");

/**
 * Creates a playlist
 *
 * @param {*} req
 * @param {*} res
 */

function verificarURLdeVideo(url) {
  const regex =
    /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return regex.test(url);
}

const videoPost = async (req, res) => {
  try {
    // Validar los campos requeridos
    ["name", "url"].forEach((field) => {
      if (!req.body[field] || req.body[field].trim() === "") {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
      }
    });

    // Verificar si se proporciona una URL de video
    const verificarurl = verificarURLdeVideo(req.body.url);
    if (!verificarurl) {
      res.status(422);
      res.json({ error: "Invalid video URL" });
      return;
    }

    // Encontrar la lista de reproducción del usuario por su ID
    const playlist = await Playlist.findOne({ user: req.body.user });

    // Verificar si se encontró la lista de reproducción del usuario
    if (!playlist) {
      res.status(404);
      res.json({ error: "User playlist not found" });
      return;
    }

    // Crear un nuevo video
    const video = new Video();
    video.name = req.body.name;
    video.url = req.body.url;

    // Agregar el nuevo video a la lista de reproducción del usuario
    playlist.playlist.push(video);

    // Guardar los cambios en la lista de reproducción
    await playlist
      .save()
      .then((data) => {
        res.status(201); // CREATED
        res.header({
          location: `/api/playlists/?id=${data.id}`,
        });
        res.json(data);
      })
      .catch((err) => {
        res.status(500);
        res.json({ error: "There was an error saving the video" });
      });
  } catch (error) {
    res.status(500);
    res.json({ error: "There was an error saving the video" });
  }
};

/**
 * Get all playlists
 *
 * @param {*} req
 * @param {*} res
 */

const videoGet = (req, res) => {
  // Verificar si se proporciona un ID de lista de reproducción y del video
  if (req.query && req.query.id && req.query.idvideo) {
    // Buscar la lista de reproducción por su ID
    Playlist.findById(req.query.id)
      .then((playlist) => {
        // Verificar si la lista de reproducción está activa
        if (!playlist.state) {
          res.status(404);
          res.json({ error: "Playlist not found" });
          return;
        }
        // Buscar el video en la lista de reproducción por su ID
        const video = playlist.playlist.find(
          (playlist) => playlist._id == req.query.idvideo
        );
        res.status(200);
        res.json(video);
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "Playlist doesnt exist" });
      });
  } else {
    // Verificar si se proporciona un ID de video
    if (req.query && req.query.id) {
      // Buscar la lista de reproducción por su ID
      Playlist.findById(req.query.id)
        .then((playlist) => {
          // Verificar si la lista de reproducción está activa
          if (!playlist.state) {
            res.status(404);
            res.json({ error: "Playlist not found" });
            return;
          }
          res.status(200);
          res.json(playlist.playlist);
        })
        .catch((err) => {
          res.status(404);
          res.json({ error: "Playlist not found" });
        });
    } else {
      // Si no se proporciona un ID de lista de reproducción, devolver todos los videos de todas las listas de reproducción activas
      Playlist.find({ state: true })
        .then((playlists) => {
          const playlistArray = playlists.map((playlist) => playlist.playlist);
          res.status(200);
          res.json(playlistArray);
        })
        .catch((err) => {
          res.status(500);
          res.json({ "Internal server error": err });
        });
    }
  }
};

/**
 * Updates a playlist
 *
 * @param {*} req
 * @param {*} res
 */
const videoPatch = async (req, res) => {
  try {
    // Verificar si se proporciona un ID de lista de reproducción y un ID de video
    if (req.query && req.query.id && req.query.idvideo) {
      // Buscar la lista de reproducción por su ID
      Playlist.findById(req.query.id)
        .then((playlist) => {
          // Verificar si la lista de reproducción está activa
          if (!playlist.state) {
            res.status(404);
            res.json({ error: "Playlist not found" });
            return;
          }

          // Validar los campos requeridos
          ["name", "url"].forEach((field) => {
            if (!req.body[field] || req.body[field].trim() === "") {
              throw new Error(
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
              );
            }
          });

          // Itera sobre los campos de la matriz y comprueba si están definidos en 'req.body'
          ["name", "url"].forEach((field) => {
            if (!req.body[field] || req.body[field].trim() === "") {
              throw new Error(
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
              );
            }
          });

          // Filtrar los videos de la lista de reproducción para excluir el video que se va a actualizar
          const videos = playlist.playlist.filter(
            (playlist) => playlist._id != req.query.idvideo
          );
          // Buscar el video que se va a actualizar en la lista de reproducción
          const video = playlist.playlist.filter(
            (playlist) => playlist._id == req.query.idvideo
          )[0];

          // Actualiza los campos del video
          video.name = req.body.name ? req.body.name : playlist.name;
          video.url = req.body.url ? req.body.url : playlist.url;

          // Verificar si se encontró el video que se va a actualizar
          if (!video) {
            res.status(404);
            res.json({ error: "Video not found in playlist" });
            return;
          }
          // Actualizar la lista de reproducción sin el video actualizado
          playlist.playlist = videos;

          // Agregar el video actualizado en la lista de reproducción
          videos.push(video);

          // Actualizar la lista de reproducción con el video actualizado
          playlist.playlist = videos;

          // Guardar los cambios en la lista de reproducción
          playlist
            .save()
            .then((playlist) => {
              res.status(200);
              res.json(
                playlist.playlist.filter(
                  (video) => video._id == req.query.idvideo
                )
              );
            })
            .catch((err) => {
              res.status(500);
              res.json({ error: "There was an error updating the video" });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(404);
          res.json({ error: "Playlist doesnt exist" });
        });
    } else {
      res.status(404);
      res.json({ error: "Playlist doesnt exist" });
    }
  } catch (err) {
    res.status(500);
    res.json({ error: "There was an error updating the video" });
  }
};

/**
 * Deletes a playlist
 *
 * @param {*} req
 * @param {*} res
 */
const videoDelete = (req, res) => {
  try {
    // Verificar si se proporciona un ID de lista de reproducción y un ID de video
    if (req.query && req.query.id && req.query.idvideo) {
      // Buscar la lista de reproducción por su ID
      Playlist.findById(req.query.id)
        .then((playlist) => {
          // Verificar si la lista de reproducción existe y está activa
          if (!playlist.state) {
            res.status(404);
            res.json({ error: "Playlist not found" });
            return;
          }

          console.log(playlist.playlist);
          // Filtrar los videos de la lista de reproducción para excluir el video que se va a eliminar
          const videos = playlist.playlist.filter(
            (playlist) => playlist._id != req.query.idvideo
          );

          // Actualizar la lista de reproducción con los videos filtrados (sin el que se elimina)
          playlist.playlist = videos;

          // Guardar los cambios en la lista de reproducción
          playlist
            .save()
            .then((playlist) => {
              res.status(200); // OK
              res.json({});
            })
            .catch((err) => {
              res.status(422);
              console.log("error while saving the video", err);
              res.json({
                error: "There was an error saving the video",
              });
            });
        })
        .catch((err) => {
          res.status(500);
          res.json({ error: "There was an error deleting the video" });
        });
    } else {
      res.status(404);
      res.json({ error: "Playlist or video not found" });
    }
  } catch (err) {
    res.status(500);
    res.json({ error: "There was an error deleting the video" });
    return;
  }
};

module.exports = {
  videoGet,
  videoPost,
  videoPatch,
  videoDelete,
};
