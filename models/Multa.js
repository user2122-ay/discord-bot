const mongoose = require("mongoose");

const multaSchema = new mongoose.Schema({

  // 👤 Multado
  discord_id: {
    type: String,
    required: true
  },

  // 🚗 Vehículo
  placa: {
    type: String,
    required: true
  },

  // 👮 Oficial
  oficial_id: {
    type: String,
    required: true
  },
  oficial_tag: {
    type: String,
    required: true
  },

  // 👮‍♂️ Compañero (opcional)
  companero_id: {
    type: String,
    default: null
  },
  companero_tag: {
    type: String,
    default: null
  },

  // 📍 Detalles
  lugar: {
    type: String,
    required: true
  },
  motivo: {
    type: String,
    required: true
  },

  // 💰 Monto
  monto: {
    type: Number,
    required: true
  },

  // 🖼️ Evidencia
  imagen_url: {
    type: String,
    required: true
  },

  // 📅 Fecha
  fecha: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("MULTAS_PTY", multaSchema);
