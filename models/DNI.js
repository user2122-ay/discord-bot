const { Schema, model } = require('mongoose');

const DNISchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  nombreIC: String,
  apellidoIC: String,
  edadIC: Number,
  fechaNacimiento: String,
  tipoSangre: String,
  numeroDNI: String
}, { timestamps: true });

module.exports = model('DNI', DNISchema);
