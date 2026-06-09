const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");

const CANAL_DEEPWEB = "1451018730460020746";
const LOGO_URL      = "https://cdn.discordapp.com/attachments/1463192290469085257/1465099204182413353/images_1769377256855.jpg";

// Frases aleatorias para variar el footer
const FRASES = [
  "Nadie sabe quién eres aquí.",
  "En la oscuridad, todos son iguales.",
  "El anonimato es el único lujo real.",
  "Sin rastro. Sin nombre. Sin miedo.",
  "Lo que se dice aquí, aquí se queda.",
  "Bienvenido a donde los secretos viven.",
  "La red profunda no olvida... pero tampoco habla."
];

module.exports = {
  permisos:  "🌐 Todos",
  categoria: "chill",

  data: new SlashCommandBuilder()
    .setName("deepweb")
    .setDescription("Enviar un mensaje anónimo a la Deep Web")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje anónimo")
        .setRequired(true)
    ),

  async execute(interaction) {

    const mensajeDW = interaction.options.getString("mensaje");

    const canal = interaction.guild.channels.cache.get(CANAL_DEEPWEB);
    if (!canal) {
      return interaction.reply({
        content: "❌ No se encontró el canal de Deep Web.",
        ephemeral: true
      });
    }

    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    const hora  = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    const container = new ContainerBuilder()
      .setAccentColor(0x1a1a2e)

      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 🕶️ Deep Web\n` +
              `-# Mensaje anónimo recibido · ${hora}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(LOGO_URL)
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(mensajeDW)
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> 🌐 *"${frase}"*`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Mensaje anónimo · Deep Web · Panamá RP V2`
        )
      );

    await canal.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });

    await interaction.reply({
      content: "🕶️ Tu mensaje fue enviado de forma anónima.",
      ephemeral: true
    });
  }
};
