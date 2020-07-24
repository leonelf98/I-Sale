const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  emailUser: {type: String},
  tituloTrabajo: {type: String},
  categoria: {type: String},
  lugar: {type: String},
  fecha: {type: Date},
  cedula: {type: String},
  clasificacion: {type: String},
  comentario: {type: Array},
  cover: {type: String}
}, {
  timestamps: true
});

module.exports = mongoose.model('Work', ProductSchema);
