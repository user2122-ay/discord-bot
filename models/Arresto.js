const mongoose = require("mongoose");

const arrestoSchema = new mongoose.Schema({

  // 👤 Arrestado
  discord_id: {
    type: String,
    required: true
  },

  // 👮 Oficial que arrestó
  oficial_id: {
    type: String,
    required: true
  },
  oficial_tag: {
    type: String,
    required: true
  },

  // 🔴 Delito
  delito: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ["grave", "moderado", "leve"],
    required: true
  },

  // ⏱ Condena RP
  condena_horas: {
    type: Number,
    required: true
  },

  // 💰 Economía
  multa: {
    type: Number,
    required: true
  },
  recompensa: {
    type: Number,
    required: true
  },

  // 📍 Detalles
  lugar: {
    type: String,
    required: true
  },
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

module.exports = mongoose.model("ARRESTOS_PTY", arrestoSchema);
