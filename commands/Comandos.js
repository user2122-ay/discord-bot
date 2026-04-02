const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comandos")
    .setDescription("Ver todos los comandos del bot y sus permisos"),

  permisos: "🌍 Todos",

  async execute(interaction) {

    const comandos = interaction.client.commands;

    const inicio = new EmbedBuilder()
      .setTitle("📜 Panel de Comandos")
      .setDescription(
        "Bienvenido al sistema de comandos del servidor.\n\n" +
        "Selecciona una categoría en el menú."
      )
      .setColor(0x3498db);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("menu_comandos")
        .setPlaceholder("Selecciona una categoría")
        .addOptions([
          { label: "Rol", value: "rol", emoji: "🎭" },
          { label: "Staff", value: "staff", emoji: "👮" },
          { label: "Economía / Chill", value: "chill", emoji: "💰" }
        ])
    );

    const msg = await interaction.reply({
      embeds: [inicio],
      components: [menu],
      ephemeral: true,
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 600000
    });

    let pagina = 0;
    let filtrados = [];
    const porPagina = 4;

    const generarEmbed = (categoria) => {
      const inicioIndex = pagina * porPagina;
      const lista = filtrados.slice(inicioIndex, inicioIndex + porPagina);

      let desc = "";

      lista.forEach(cmd => {
        desc += `**/${cmd.data.name}**\n📄 ${cmd.data.description}\n🔒 ${cmd.permisos || "Ninguno"}\n\n`;
      });

      return new EmbedBuilder()
        .setTitle(`📂 Categoría: ${categoria.toUpperCase()}`)
        .setDescription(desc || "Sin comandos")
        .setFooter({ text: `Página ${pagina + 1} de ${Math.ceil(filtrados.length / porPagina)}` })
        .setColor(0x2ecc71);
    };

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("anterior")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("volver")
        .setLabel("🔙 Volver")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("siguiente")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Secondary)
    );

    collector.on("collect", async i => {

      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ No puedes usar esto.", ephemeral: true });
      }

      if (i.customId === "menu_comandos") {

        const categoria = i.values[0];
        pagina = 0;

        if (categoria === "rol") {
          filtrados = comandos.filter(c =>
            ["entorno", "verdni", "verarresto"].includes(c.data.name)
          );
        }

        if (categoria === "staff") {
          filtrados = comandos.filter(c =>
            ["sesion", "multar", "noticia"].includes(c.data.name)
          );
        }

        if (categoria === "chill") {
          filtrados = comandos.filter(c =>
            ["ping", "sugerencia", "vermultas"].includes(c.data.name)
          );
        }

        await i.update({
          embeds: [generarEmbed(categoria)],
          components: [botones]
        });
      }

      if (i.customId === "siguiente") {
        if ((pagina + 1) * porPagina < filtrados.length) pagina++;

        await i.update({
          embeds: [generarEmbed("Categoría")],
          components: [botones]
        });
      }

      if (i.customId === "anterior") {
        if (pagina > 0) pagina--;

        await i.update({
          embeds: [generarEmbed("Categoría")],
          components: [botones]
        });
      }

      if (i.customId === "volver") {
        pagina = 0;
        filtrados = [];

        await i.update({
          embeds: [inicio],
          components: [menu]
        });
      }

    });
  }
};
