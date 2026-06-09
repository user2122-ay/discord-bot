const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  discordId: {
    type: String,
    required: true,
    unique: true
  },

  username: {
    type: String,
    required: true
  },

  saldo: {
    type: Number,
    default: 0
  },

  banco: {
    type: Number,
    default: 0
  },

  trabajo: {
    type: String,
    default: "Civil"
  },

  cuenta: {
    type: String,
    unique: true
  },

  impuestos: {
    type: String,
    default: "Bajo"
  },

  ultimoPago: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }, 
  prestamo:{
  type:Number,
  default:0
},

ultimoPrestamo:{
  type:Date,
  default:null
}, 
  ultimoCobro:{
  type:Date,
  default:null
}, 

});

module.exports =
mongoose.models.User ||
mongoose.model("User", UserSchema);
