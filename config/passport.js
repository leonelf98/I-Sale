const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/user');

passport.serializeUser((usuario, done) => { //marcado entre el objeto y el _id coockie xD
  done(null, usuario._id);
})

passport.deserializeUser((id, done) => {
  Usuario.findById(id, (err, usuario) => {
    done(err, usuario);
  })
})

//Estrategia local para verificar el email y contraseña la autentificacion en la base de datos
passport.use(new LocalStrategy(
  {usernameField: 'email'},
  (email, password, done) => {
    Usuario.findOne({email}, (err, usuario) =>{
      if (!usuario) {
        return done(null, false, {message: `Este email: ${email} no esta registrado`});
      } else {
        usuario.compararPassword(password, (err, sonIguales) => {
          if (sonIguales) {
            return done(null, usuario);
          } else {
            return done(null, false, {message: 'La contraseña no es valida'});
          }
        }) //Compara contraseña con el metido creado en user.js
      }
    })
  }
))

//Ruta para el usuario autentificado
exports.estaAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) { //pare ver si el usuario esta autorizado para ver xD
    return next();
  }
  res.status(401).send('Tienes que hacer login para acceder'); //error 401 se muestra para que el usuario haga login
}
