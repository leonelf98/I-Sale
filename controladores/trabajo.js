// MANEJAR LLAMADAS DENTRO DE LA APLICACION E INTERACTUAR CON LOS MODELOS
const passport = require('passport');
const Work = require('../models/work');

exports.postRegistrar = (req, res, next) => {

    const nuevoTrabajo = new Work({ //crear nuevo trabajo
      nombre:req.body.nombre,
      apellido: req.body.apellido,
      userID: req.body.id,
      publicaciones:{
          categoria: req.body.categoria,
          tituloTrabajo: req.body.tituloTrabajo,
          lugar: req.body.lugar,
          descripcion: req.body.descripcion,
      },
      file: req.file.originalname
    });

    nuevoTrabajo.save((err) => {
      if (err) {
        next(err);
      }

      var session = req.user;
      var qwery1 = { "userID" : session._id }; //CONSULTA PARA LA TABLA DE TRABAJOS
      Work
        .find(qwery1) // finding all documents
        .exec((err, works) => {
              res.type('text/html');
              res.render('partes/perfil', {session, works});
        });

    })

  }
