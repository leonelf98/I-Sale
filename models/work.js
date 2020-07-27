const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  userID : {type: Schema.ObjectId, ref : "usuario"},
  nombre : {type: String},
  apellido : {type: String},
  publicaciones : {type: Object,
    tituloTrabajo : {type: String},
    categoria : {type: String},
    lugar : {type: String},
    fecha : {type: Date},
    clasificacion: {type: String},
    comentarios : {type : Array},
    descripcion : {type : String}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Work', productSchema);
