const Playlist = require("../models/playlistModel");
const User = require("../models/userModel");
const Video = require("../models/videoModel");

// const User = require("../models/userModel");

/**
 * Creates a playlist
 *
 * @param {*} req
 * @param {*} res
 */

// function verificarURLdeVideo(url) {
//   const regex =
//     /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//   return regex.test(url);
// }

const playlistPost = async (req, res) => {
  try {
    // Crear instancias de Playlist y Video
    const playlist = new Playlist();
    // const video = new Video();

    /* 
    const user = User.findById(req.body.user);
    if (!user || !user.state) {
      res.status(404);
      res.json({error: "User not found"});
      return;
    }

    const validplaylist = user.number_playlists > 0; 
    */

    // Verificar si ya existe una playlist para el usuario y si la URL del video es válida
    // const existingPlaylist = !(await Playlist.findOne({ user: req.body.user }));
    // const verificarurl = verificarURLdeVideo(req.body.url);
    const user = await User.findById(req.body.user);
    if (!user.state) {
      res.status(404);
      res.json({ error: "User doesnt exist" });
      return;
    }

    // if (verificarurl) {
    //   res.status(422);
    //   res.json({ error: "Invalid url" });
    //   return;
    // }
    if (!(user.number_playlists > 0)) {
      res.status(404);
      res.json({ error: "You can't create more playlist" });
      return;
    }
    // Asignar valores de req.body a las instancias


    playlist.name = req.body.name;
    playlist.user = req.body.user;
    // video.name = req.body.name;
    // video.url = req.body.url;

    playlist.state = true;
    // playlist.playlist = video;
    // Guardar la playlist y enviar la respuesta

    await playlist
      .save()
      .then((data) => {
        user.number_playlists--;

        /* 
      user.number_playlists --;
      
      user
      .save()
      .then(() => {
        res.status(201); // CREATED
        res.header({
          location: `/api/playlists/?id=${data.id}`,
              });
              res.json(data);
            })
            .catch((err) => {
              res.status(422);
              console.log("error while saving the playlist", err);
              res.json({
                error: "There was an error saving the playlist",
              });
            }); 
          */

        user
          .save()
          .then(() => {
            res.status(201);
            res.header({ location: `/api/playlists/?id=${data.id}` });
            res.json(data);
          })
          .catch((err) => {
            res.status(500);
            res.json({
              error: "There was an error saving the account",
            });
          });
        // res.status(201); // CREATED
        // res.header({ location: `/api/playlists/?id=${data.id}` });
        // res.json(data);
      })
      .catch((err) => {
        res.status(500);
        res.json({ error: "There was an error saving the playlist" });
      });
  } catch (err) {
    res.status(500);
    console.log("?");
    res.json({ error: "There was an error saving the playlist" });
  }
};

/**
 * Get all playlists
 *
 * @param {*} req
 * @param {*} res
 */
const playlistGet = (req, res) => {
  // Verificar si se proporciona un ID de lista de reproducción

  if (req.query && req.query.iduser) {
    User.findById(req.query.iduser)
      .then((user) => {
        if (!user.state) {
          res.status(404);
          res.json({ error: "User doesnt exist" });
          return;
        }
        // Obtener la lista de reproducción por su ID
        Playlist.find({ state: true })
          .then((playlists) => {
            const playlist = playlists.filter(
              (playlist) => playlist.user == req.query.iduser
            );

            res.status(200);
            res.json(playlist);
          })
          .catch((err) => {
            res.status(404);
            res.json({ error: "Playlist not found" });
          });
      })
      .catch((err) => {
        res.status(500);
        res.json({ error: "Internal server error" });
      });
  } else if (req.query && req.query.id) {
    // Obtener la lista de reproducción por su ID
    Playlist.findById(req.query.id)
      .then((playlist) => {
        // Verificar si la lista de reproducción está activa
        if (!playlist.state) {
          res.status(404);
          res.json({ error: "Playlist doesnt exist" });
          return;
        }
        res.status(200);
        res.json(playlist);
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "Playlist not found" });
      });
  } else {
    // Obtener todas las listas de reproducción activas
    Playlist.find({ state: true })
      .then((playlists) => {
        res.status(200);
        res.json(playlists);
      })
      .catch((err) => {
        res.status(500);
        res.json({ "Internal server error": err });
      });
  }
};

/* *
 * Updates a playlist
 *
 * @param {*} req
 * @param {*} res
 */

/* const playlistPatch = (req, res) => {
    // get playlist by id
    if (req.query && req.query.id) {
        Playlist.findById(req.query.id, function (err, playlist) {
            if (err) {
                res.status(404);
                console.log('error while queryting the playlist', err)
                res.json({ error: "Playlist doesnt exist" })
                return;
            }

            // update the playlist object (patch)
            // playlist.title = req.body.title ? req.body.title : playlist.title;
            // playlist.detail = req.body.detail ? req.body.detail : playlist.detail;
            // update the playlist object (put)
            // playlist.title = req.body.title
            // playlist.detail = req.body.detail

            playlist.save(function (err) {
                if (err) {
                    res.status(422);
                    console.log('error while saving the playlist', err)
                    res.json({
                        error: 'There was an error saving the playlist'
                    });
                    return;
                }
                res.status(200); // OK
                res.json(playlist);
            });
        });
    } else {
        res.status(404);
        res.json({ error: "Playlist doesnt exist" })
    }
}; */

/**
 * Deletes a playlist
 *
 * @param {*} req
 * @param {*} res
 */
const playlistDelete = (req, res) => {
  // Verificar si se proporciona un ID de lista de reproducción
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
        // Actualizar el estado de la lista de reproducción a inactivo
        playlist.state = false;

        // Guardar los cambios en la lista de reproducción
        playlist
          .save()
          .then((playlist) => {
            res.status(204); //No content
            res.json({});
          })
          .catch((err) => {
            res.status(422);
            res.json({ error: "There was an error deleting the playlist" });
          });
      })
      .catch((err) => {
        res.status(404);
        res.json({ error: "Playlist not found" });
      });
  } else {
    res.status(400);
    res.json({ error: "Playlist ID is required in query parameters" });
  }
};

module.exports = {
  playlistGet,
  playlistPost,
  // playlistPatch,
  playlistDelete,
};
