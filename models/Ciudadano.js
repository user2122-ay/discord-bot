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
  sexo_ic: {
  type: String,
  required: true,
  enum: ["M", "F"]  // solo acepta M o F
},

  numero_cedula: {
    type: String,
    required: true,
    unique: true
  },

  // 📸 Avatar Roblox usado en la cédula
  avatarRoblox: {
    type: String,
    default: null
  },

  // 📅 Fecha emisión
  fecha_emision: {
    type: Date,
    default: Date.now
  },

  // ⏳ Fecha expiración
  fecha_expiracion: {
    type: Date,
    default: () => {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() + 3);
      return fecha;
    }
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "CIUDADANOS_PTY",
  ciudadanoSchema
);
