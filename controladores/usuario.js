// MANEJAR LLAMADAS DENTRO DE LA APLICACION E INTERACTUAR CON LOS MODELOS
const passport = require('passport');
const Usuario = require('../models/user');
const Work = require('../models/work'); // importa el esquema

//ruta para crear los usuarios, METODO PARA CREAR USUARIOS
exports.postSignup = (req, res, next) => {

  const nuevoUsuario = new Usuario({ //crear nuevo usuario
    email: req.body.email,  //peticion del body ._.
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    password: req.body.password,
    telefono: req.body.telefono,
    trabajo: req.body.trabajo,
    servicio:{
     cedula: req.body.cedula,
     especialidad: req.body.especialidad,
     areaTrabajo: req.body.areaTrabajo,
     zonaTrabajo: req.body.zonaTrabajo
   },
    file: req.file.originalname,
    desc: req.body.desc

  });

  Usuario.findOne({email : req.body.email}, (err, usuarioExistente) => { //funcion anonima
    if (usuarioExistente) {
      return res.status(400).send(" <script> alert('El correo ya existe');window.location='/Registro'; </script>");
    }
    Usuario.findOne({"servicio.cedula" : req.body.cedula}, (err, usuarioExistente) => { //funcion anonima
      if (usuarioExistente) {
        return res.status(400).send(" <script> alert('La cedula existe');window.location='/Registro'; </script>");
      }
    nuevoUsuario.save((err) => {
      if (err) {
        next(err);
      }
      req.logIn(nuevoUsuario, (err) => {
        if (err) {
          next(err); //milware
        }

        let perPage = 9;
        let page = req.params.page || 1;
        var session = req.user;

        Work
          .find({}) // finding all documents
          .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
          .limit(perPage) // output just 9 items
          .exec((err, works) => {
              if (err) return next(err);
              res.render('index', {
                session,
                works,
              });
          });

      })
    })
  })})
}

//res.status(400).send('Email o contraseña no válidos');
//METODO PARA LOGUEARSE USUARIOS EXISTENTES
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, usuario, info) => {
    if (err) {
      next(err);
    }
    if (!usuario) {
      var msg = 'Email o Contraseña no validos';
      var error = '400';
      var session = req.user;
      return res.type('text/html').status(400).render( 'partes/404', {error, msg, session},
      function(err, html){
          if(err) throw err;
          res.send(html);
      });
    }
    req.logIn(usuario, (err) => {
      if (err) {
        next(err);
      }

      let perPage = 9;
      let page = req.params.page || 1;
      var session = req.user;

      Work
        .find({}) // finding all documents
        .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
        .limit(perPage) // output just 9 items
        .exec((err, works) => {
            if (err) return next(err);
            res.render('index', {
              session,
              works,
            });
        });

    })
  })(req, res, next);
}

//METODO PARA LOGOUT
exports.logout = (req, res) => { //funcion anonima que recibe un req y un res
  req.logout();

      let perPage = 9;
      let page = req.params.page || 1;
      var session = req.user;

      Work
        .find({}) // finding all documents
        .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
        .limit(perPage) // output just 9 items
        .exec((err, works) => {
            if (err) return next(err);
            res.render('index', {
            session,
            works,
        });
      });
}
