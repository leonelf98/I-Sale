const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  nombre: {type: String, required: true},
  apellido: {type: String, required: true},
  cedula: {type: String},
  servicio: {type : Object,
    areaTrabajo : {type : Array},
    zonaTrabajo : {type : Array},
    especialidad : {type : Array},
    telefono: {type: Array}
  },
  file: {type: String},
  desc: {type: String}
}, {
  timestamps: true
});

userSchema.pre('save', function(next){
  const usuario = this;
  if (!usuario.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      next(err);
    }
    bcrypt.hash(usuario.password, salt, null, (err, hash) => {
        if (err){
          next(err);
        }
        usuario.password = hash;
        next();
    })
  })
});

userSchema.methods.compararPassword = function(password, cb) {
  bcrypt.compare(password, this.password, (err, sonIguales) => {
    if (err){
      return cb(err);
    }
    cb(null, sonIguales);
  })
}


module.exports = mongoose.model('Usuario', userSchema);
