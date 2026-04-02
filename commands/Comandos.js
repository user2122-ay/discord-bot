const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comandos")
    .setDescription("Ver todos los comandos del bot y sus permisos"),

  permisos: "🌍 Todos",

  async execute(interaction) {

    const comandos = interaction.client.commands;

    // 📌 EMBED PRINCIPAL
    const inicio = new EmbedBuilder()
      .setTitle("📜 Panel de Comandos")
      .setDescription(
        "Bienvenido al sistema de comandos del servidor.\n\n" +
        "Aquí podrás explorar todas las funciones disponibles.\n\n" +
        "📂 Selecciona una categoría en el menú de abajo."
      )
      .setColor(0x3498db);

    // 📂 MENÚ
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

    await interaction.reply({
      embeds: [inicio],
      components: [menu],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({ time: 600000 });

    collector.on("collect", async i => {

      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ No puedes usar esto.", ephemeral: true });
      }

      // 🔙 BOTÓN VOLVER
      if (i.customId === "volver") {
        return i.update({
          embeds: [inicio],
          components: [menu]
        });
      }

      // 📂 SELECCIÓN DE CATEGORÍA
      if (i.customId === "menu_comandos") {

        const categoria = i.values[0];

        // 🔹 FILTRAR (puedes personalizar nombres aquí)
        let filtrados = [];

        if (categoria === "rol") {
          filtrados = comandos.filter(c => 
            ["entorno","verdni","verarresto"].includes(c.data.name)
          );
        }

        if (categoria === "staff") {
          filtrados = comandos.filter(c => 
            ["sesion","multar","noticia"].includes(c.data.name)
          );
        }

        if (categoria === "chill") {
          filtrados = comandos.filter(c => 
            ["ping","sugerencia","vermultas"].includes(c.data.name)
          );
        }

        let pagina = 0;
        const porPagina = 4;

        const generarEmbed = () => {
          const inicio = pagina * porPagina;
          const lista = filtrados.slice(inicio, inicio + porPagina);

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

        await i.update({
          embeds: [generarEmbed()],
          components: [botones]
        });

        const subCollector = i.message.createMessageComponentCollector({ time: 600000 });

        subCollector.on("collect", async btn => {

          if (btn.user.id !== interaction.user.id) {
            return btn.reply({ content: "❌ No puedes usar esto.", ephemeral: true });
          }

          if (btn.customId === "siguiente") {
            if ((pagina + 1) * porPagina < filtrados.length) pagina++;
          }

          if (btn.customId === "anterior") {
            if (pagina > 0) pagina--;
          }

          if (btn.customId === "volver") {
            return btn.update({
              embeds: [inicio],
              components: [menu]
            });
          }

          await btn.update({
            embeds: [generarEmbed()],
            components: [botones]
          });
        });

      }

    });
  }
};
