const {
  SlashCommandBuilder,
  AttachmentBuilder
} = require("discord.js");

const Ciudadano = require("../models/Ciudadano");
const RobloxVerificado = require("../models/RobloxVerificado");
const generarCedula = require("../utils/generarCedula");

// 🧾 ROL QUE SE DA AL CREAR DNI
const ROL_DNI = "1451018398874996966";

// 🌎 MAPA DE PROVINCIAS
const PROVINCIAS = {
  "1": "Bocas del Toro",
  "2": "Coclé",
  "3": "Colón",
  "4": "Chiriquí",
  "5": "Darién",
  "6": "Herrera",
  "7": "Los Santos",
  "8": "Panamá",
  "9": "Veraguas",
  "13": "Panamá Oeste"
};

module.exports = {
  permisos: "🌐 Todos",

  data: new SlashCommandBuilder()
    .setName("crearcedula")
    .setDescription("Crear cédula Panamá RP V2")

    .addStringOption(o =>
      o.setName("nombre")
        .setDescription("Nombre IC")
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName("apellido")
        .setDescription("Apellido IC")
        .setRequired(true)
    )

    .addIntegerOption(o =>
      o.setName("edad")
        .setDescription("Edad IC")
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName("nacimiento")
        .setDescription("Fecha de nacimiento")
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName("sangre")
        .setDescription("Tipo de sangre")
        .setRequired(true)
        .addChoices(
          { name: "O+", value: "O+" },
          { name: "O-", value: "O-" },
          { name: "A+", value: "A+" },
          { name: "A-", value: "A-" },
          { name: "B+", value: "B+" },
          { name: "B-", value: "B-" },
          { name: "AB+", value: "AB+" },
          { name: "AB-", value: "AB-" }
        )
    )

    .addStringOption(o =>
      o.setName("provincia")
        .setDescription("Provincia")
        .setRequired(true)
        .addChoices(
          { name: "Bocas del Toro", value: "1" },
          { name: "Coclé", value: "2" },
          { name: "Colón", value: "3" },
          { name: "Chiriquí", value: "4" },
          { name: "Darién", value: "5" },
          { name: "Herrera", value: "6" },
          { name: "Los Santos", value: "7" },
          { name: "Panamá", value: "8" },
          { name: "Veraguas", value: "9" },
          { name: "Panamá Oeste", value: "13" }
        )
    ),

  async execute(interaction) {

    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const nacimiento = interaction.options.getString("nacimiento");
    const sangre = interaction.options.getString("sangre");
    const provincia = interaction.options.getString("provincia");

    try {

      // 🔍 Ya tiene cédula
      const existe = await Ciudadano.findOne({
        discord_id: interaction.user.id
      });

      if (existe) {
        return interaction.reply({
          content: "❌ Ya tienes una cédula registrada.",
          ephemeral: true
        });
      }

      // 🔍 Buscar Roblox verificado
      const roblox = await RobloxVerificado.findOne({
        discordId: interaction.user.id
      });

      if (!roblox) {
        return interaction.reply({
          content: "❌ Debes verificar Roblox primero.",
          ephemeral: true
        });
      }

      // 🔢 Generar número de cédula
      const tomo = Math.floor(100 + Math.random() * 900);
      const asiento = Math.floor(1000 + Math.random() * 9000);

      const cedula = `${provincia}-${tomo}-${asiento}`;

      // 📅 Fechas
      const fechaEmision = new Date();

      const fechaExpiracion = new Date();
      fechaExpiracion.setMonth(
        fechaExpiracion.getMonth() + 3
      );

      // 💾 Guardar ciudadano
      const ciudadano = await Ciudadano.create({
        discord_id: interaction.user.id,
        nombre_ic: nombre,
        apellido_ic: apellido,
        edad_ic: edad,
        nacimiento_ic: nacimiento,
        tipo_sangre: sangre,
        provincia_codigo: provincia,
        numero_cedula: cedula,

        avatarRoblox: roblox.avatarUrl,

        fecha_emision: fechaEmision,
        fecha_expiracion: fechaExpiracion
      });

      // 🎭 Dar rol
      if (!interaction.member.roles.cache.has(ROL_DNI)) {
        await interaction.member.roles.add(ROL_DNI)
          .catch(() => {});
      }

      // 🖼️ Generar imagen
      const buffer = await generarCedula({
        nombre,
        apellido,
        edad,
        nacimiento,
        sangre,
        provincia: PROVINCIAS[provincia],
        cedula,
        avatar: roblox.avatarUrl,
        fechaEmision,
        fechaExpiracion
      });

      const archivo = new AttachmentBuilder(
        buffer,
        { name: "cedula.png" }
      );

      await interaction.reply({
        content: "✅ Cédula creada correctamente.",
        files: [archivo]
      });

    } catch (err) {

      console.error(err);

      return interaction.reply({
        content: "❌ Error creando la cédula.",
        ephemeral: true
      });

    }
  }
};
