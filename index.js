require("dotenv").config();
const fs = require("fs");
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔧 IDS (NO CAMBIES)
const GUILD_ID = "1463192289974157334";
const CANAL_APROBACION = "1463192293312958631";

const ROL_VERIFICADO = "1463192290314162342";
const ROL_CIUDADANO = "1463192290360295646";
const ROL_NO_VERIFICADO = "1463192290314162341";

// ======================
// CARGAR COMANDOS
// ======================
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ======================
// READY + REGISTRO
// ======================
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = client.commands.map(cmd => cmd.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Comandos registrados");
});

// ======================
// INTERACCIONES
// ======================
client.on("interactionCreate", async interaction => {

  // 🔹 COMANDOS
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
  }

  // 🔹 BOTÓN VERIFICARSE
  if (interaction.isButton() && interaction.customId === "btn_verificarse") {
    const modal = new ModalBuilder()
      .setCustomId("modal_verificacion")
      .setTitle("Formulario de Verificación");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("roblox")
          .setLabel("Usuario de Roblox")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("edad")
          .setLabel("Edad OOC")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("mg")
          .setLabel("¿Qué es MG?")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("pg")
          .setLabel("¿Qué es PG?")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("acepta")
          .setLabel("¿Aceptas normativa y decisiones del staff?")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  // 🔹 MODAL ENVIADO
  if (interaction.isModalSubmit() && interaction.customId === "modal_verificacion") {
    const roblox = interaction.fields.getTextInputValue("roblox");

    const embed = new EmbedBuilder()
      .setTitle("📋 Nueva Solicitud de Verificación")
      .setColor(0xf1c40f)
      .addFields(
        { name: "👤 Usuario", value: `<@${interaction.user.id}>` },
        { name: "🎮 Roblox", value: roblox },
        { name: "🎂 Edad OOC", value: interaction.fields.getTextInputValue("edad") },
        { name: "📘 MG", value: interaction.fields.getTextInputValue("mg") },
        { name: "📕 PG", value: interaction.fields.getTextInputValue("pg") },
        { name: "✅ Acepta normas", value: interaction.fields.getTextInputValue("acepta") }
      )
      .setFooter({ text: `ID Usuario: ${interaction.user.id}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprobar_${interaction.user.id}_${roblox}`)
        .setLabel("Aprobar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`rechazar_${interaction.user.id}`)
        .setLabel("Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    const canal = interaction.guild.channels.cache.get(CANAL_APROBACION);
    await canal.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: "📨 Tu verificación fue enviada al staff.",
      ephemeral: true
    });
  }

  // 🔹 APROBAR
  if (interaction.isButton() && interaction.customId.startsWith("aprobar_")) {
    const [, userId, roblox] = interaction.customId.split("_");
    const member = await interaction.guild.members.fetch(userId);

    await member.roles.add([ROL_VERIFICADO, ROL_CIUDADANO]);
    await member.roles.remove(ROL_NO_VERIFICADO);
    await member.setNickname(roblox);

    await member.send("✅ Tu verificación fue **APROBADA**.");

    return interaction.update({ content: "✅ Verificación aprobada", embeds: [], components: [] });
  }

  // 🔹 RECHAZAR
  if (interaction.isButton() && interaction.customId.startsWith("rechazar_")) {
    const [, userId] = interaction.customId.split("_");
    const member = await interaction.guild.members.fetch(userId);

    await member.send("❌ Tu verificación fue **RECHAZADA**.");

    return interaction.update({ content: "❌ Verificación rechazada", embeds: [], components: [] });
  }
});

// LOGIN
client.login(process.env.TOKEN);
