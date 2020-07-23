// MANEJAR LLAMADAS DENTRO DE LA APLICACION E INTERACTUAR CON LOS MODELOS
const passport = require('passport');
const Usuario = require('../models/user');

//ruta para crear los usuarios, METODO PARA CREAR USUARIOS
exports.postSignup = (req, res, next) => {

  const nuevoUsuario = new Usuario({ //crear nuevo usuario
    email: req.body.email,  //peticion del body ._.
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    password: req.body.password,
    cedula: req.body.cedula,
    telefono: req.body.telefono,
    file: req.file.originalname,
    desc: req.body.desc

  });

  Usuario.findOne({email: req.body.email}, (err, usuarioExistente) => { //funcion anonima
    if (usuarioExistente) {
      return res.status(400).send('Ya ese email esta registrado');
    }
    nuevoUsuario.save((err) => {
      if (err) {
        next(err);
      }
      req.logIn(nuevoUsuario, (err) => {
        if (err) {
          next(err); //milware
        }
      //  res.send('Usuario creado exitosamente');
        res.type('text/html');
        var session = req.user;
        res.render('partes/perfil', {session},
        function(err, html){
            if(err) throw err;
            res.send(html);
        });
      })
    })
  })
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
      // res.send('Login exitoso');
      res.type('text/html');
      var session = req.user;
      res.render('partes/perfil', {session},
      function(err, html){
          if(err) throw err;
          res.send(html);
      });
    })
  })(req, res, next);
}

//METODO PARA LOGOUT
exports.logout = (req, res) => { //funcion anonima que recibe un req y un res
  req.logout();
  res.type('text/html');
  var session = req.user;
  res.render('index', {session},
  function(err, html){
      if(err) throw err;
      res.send(html);
  });
}
