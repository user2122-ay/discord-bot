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

    const comandos = [...interaction.client.commands.values()];

    let categoriaActual = null;
    let pagina = 0;
    const porPagina = 5;

    // 📌 PANEL INICIAL
    const inicio = new EmbedBuilder()
      .setTitle("📜 Panel de Comandos")
      .setDescription("Selecciona una categoría.")
      .setColor(0x3498db);

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("menu")
        .setPlaceholder("Selecciona categoría")
        .addOptions([
          { label: "🎭 Roleplay", value: "rol" },
          { label: "💰 Economía", value: "eco" },
          { label: "🛡️ Staff", value: "staff" },
          { label: "💬 Chill", value: "chill" }
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

      // 🔙 VOLVER
      if (i.customId === "volver") {
        categoriaActual = null;
        return i.update({
          embeds: [inicio],
          components: [menu]
        });
      }

      // 📂 MENÚ
      if (i.customId === "menu") {
        categoriaActual = i.values[0];
        pagina = 0;
      }

      // 🔥 FILTRO SEGÚN TU SISTEMA
      let filtrados = comandos.filter(cmd => {
        const p = cmd.permisos || "";

        if (categoriaActual === "rol") return ["noticia","entorno","verdni","verarresto","vermultas","deepweb","creardni","arrestar"].includes(cmd.data.name);
        if (categoriaActual === "eco") return ["balance","transferir","depositar","retirar","top-dinero","cobrar","añadir-dinero","quitar-dinero","añadir-sueldo"].includes(cmd.data.name);
        if (categoriaActual === "staff") return ["alerta","clear","sesion"].includes(cmd.data.name);
        if (categoriaActual === "chill") return ["ping","sugerencia","comandos"].includes(cmd.data.name);

        return false;
      });

      // ⬅️➡️ BOTONES
      if (i.customId === "siguiente") {
        if ((pagina + 1) * porPagina < filtrados.length) pagina++;
      }

      if (i.customId === "anterior") {
        if (pagina > 0) pagina--;
      }

      // 📄 EMBED DINÁMICO
      const generarEmbed = () => {
        const inicioIndex = pagina * porPagina;
        const lista = filtrados.slice(inicioIndex, inicioIndex + porPagina);

        let desc = "";

        lista.forEach(cmd => {
          desc += `**/${cmd.data.name}**\n📄 ${cmd.data.description}\n🔒 ${cmd.permisos || "Ninguno"}\n\n`;
        });

        const titulos = {
          rol: "🎭 Roleplay",
          eco: "💰 Economía",
          staff: "🛡️ Staff",
          chill: "💬 Chill"
        };

        return new EmbedBuilder()
          .setTitle(titulos[categoriaActual] || "Comandos")
          .setDescription(desc || "Sin comandos")
          .setFooter({
            text: `Página ${pagina + 1} / ${Math.max(1, Math.ceil(filtrados.length / porPagina))}`
          })
          .setColor(0x2ecc71);
      };

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("anterior").setLabel("⬅️").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("volver").setLabel("🔙").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("siguiente").setLabel("➡️").setStyle(ButtonStyle.Secondary)
      );

      await i.update({
        embeds: [generarEmbed()],
        components: [botones]
      });

    });

  }
};
