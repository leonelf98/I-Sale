const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  passwordFake: {type: String},
  nombre: {type: String, required: true},
  apellido: {type: String, required: true},
  telefono: {type: String },
  trabajo: {type: String, required: true},
  servicio: {type : Object,
    areaTrabajo: {type: Array, required: false},
    zonaTrabajo: {type: String, required: false},
    especialidad: {type: String, required: false},
    cedula: {type: String, required: false}
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
