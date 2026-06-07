const mongoose = require("mongoose");

const accionSchema = new mongoose.Schema({

  // 🔑 Código único de la acción
  codigo: {
    type: String,
    required: true,
    unique: true
  },

  // Tipo de acción
  tipo: {
    type: String,
    enum: ["strike", "sancion"],
    required: true
  },

  // Número (strike 1-3 / sanción 1-6)
  numero: {
    type: Number,
    required: true
  },

  // Motivo
  motivo: {
    type: String,
    required: true
  },

  // Staff que aplicó
  staff_id: {
    type: String,
    required: true
  },
  staff_tag: {
    type: String,
    required: true
  },

  // Fecha
  fecha: {
    type: Date,
    default: Date.now
  },

  // ⏱ Duración timeout (solo sanciones)
  duracion_timeout: {
    type: String,
    default: null
  },

  // 🎮 ERLC
  erlc_ejecutado: {
    type: Boolean,
    default: false
  },
  erlc_respuesta: {
    type: String,
    default: null
  },

  // 🗑️ Estado de la acción
  removido: {
    type: Boolean,
    default: false
  },
  removido_por_id: {
    type: String,
    default: null
  },
  removido_por_tag: {
    type: String,
    default: null
  },
  removido_razon: {
    type: String,
    default: null
  },
  removido_fecha: {
    type: Date,
    default: null
  }

});

const sancionSchema = new mongoose.Schema({

  discord_id: {
    type: String,
    required: true,
    unique: true
  },

  // Contadores activos (no removidos)
  strikes_actuales: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },

  sanciones_acumuladas: {
    type: Number,
    default: 0,
    min: 0,
    max: 6
  },

  baneado: {
    type: Boolean,
    default: false
  },

  // 📋 Todas las acciones (strikes y sanciones)
  acciones: [accionSchema]

}, {
  timestamps: true
});

// 🔑 Generar código único
sancionSchema.statics.generarCodigo = function(tipo) {
  const prefijo = tipo === "strike" ? "STK" : "SAN";
  const chars   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random  = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `${prefijo}-${random}`;
};

// 🔍 Buscar acción por código
sancionSchema.statics.buscarPorCodigo = async function(codigo) {
  const registro = await this.findOne({
    "acciones.codigo": codigo
  });
  if (!registro) return null;

  const accion = registro.acciones.find(a => a.codigo === codigo);
  return { registro, accion };
};

module.exports = mongoose.model("SANCIONES_PTY", sancionSchema);
