const mongoose = require("mongoose");

const accionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["strike", "sancion", "ban"],
    required: true
  },
  numero: {
    type: Number, // Strike 1-3 / Sanción 1-6
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  staff_id: {
    type: String,
    required: true
  },
  staff_tag: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  // ⏱ Si hubo timeout, cuánto duró
  duracion_timeout: {
    type: String,
    default: null
  },
  // 🎮 Si se ejecutó comando en ERLC
  erlc_ejecutado: {
    type: Boolean,
    default: false
  },
  erlc_respuesta: {
    type: String,
    default: null
  }
});

const sancionSchema = new mongoose.Schema({

  discord_id: {
    type: String,
    required: true,
    unique: true
  },

  // 🎯 Strikes actuales (se resetean al llegar a 3)
  strikes_actuales: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },

  // ⚠️ Sanciones acumuladas (máx 6)
  sanciones_acumuladas: {
    type: Number,
    default: 0,
    min: 0,
    max: 6
  },

  // 🔨 Si está baneado permanentemente
  baneado: {
    type: Boolean,
    default: false
  },

  // 📋 Historial completo de acciones
  historial: [accionSchema]

}, {
  timestamps: true
});

module.exports = mongoose.model("SANCIONES_PTY", sancionSchema);
