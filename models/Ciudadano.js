const mongoose = require("mongoose");

const ciudadanoSchema = new mongoose.Schema({

  discord_id: {
    type: String,
    required: true,
    unique: true
  },

  nombre_ic: {
    type: String,
    required: true
  },

  apellido_ic: {
    type: String,
    required: true
  },

  edad_ic: {
    type: Number,
    required: true
  },

  nacimiento_ic: {
    type: String,
    required: true
  },

  tipo_sangre: {
    type: String,
    required: true
  },

  provincia_codigo: {
    type: String,
    required: true
  },

  numero_cedula: {
    type: String,
    required: true,
    unique: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "CIUDADANOS_PTY",
  ciudadanoSchema
);
