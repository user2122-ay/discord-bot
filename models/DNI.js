const { Schema, model } = require('mongoose');

const DNISchema = new Schema({
  discordId: { type: String, unique: true },
  nombreIC: String,
  apellidoIC: String,
  edadIC: Number,
  fechaNacimiento: String,
  tipoSangre: String,
  numeroDNI: String
});

module.exports = model('DNI', DNISchema);
