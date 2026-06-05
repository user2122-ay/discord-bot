const mongoose = require("mongoose");

const RobloxVerificadoSchema = new mongoose.Schema({

  discordId: {
    type: String,
    required: true,
    unique: true
  },

  robloxId: {
    type: String,
    required: true,
    unique: true
  },

  robloxUser: {
    type: String,
    required: true
  },

  avatarUrl: {
    type: String,
    default: null
  },

  fecha: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "RobloxVerificado",
  RobloxVerificadoSchema
);
