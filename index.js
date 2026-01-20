const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  EmbedBuilder 
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const GUILD_ID = "TU_GUILD_ID";
const ROL_PERMITIDO = "1451018445998260266";
const ROL_DNI = "1451018398874996966";

client.once("ready", async () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("creardni")
      .setDescription("Crear DNI de Los Santos RP")
      .addStringOption(o => o.setName("nombre").setDescription("Nombre").setRequired(true))
      .addStringOption(o => o.setName("apellido").setDescription("Apellido").setRequired(true))
      .addIntegerOption(o => o.setName("edad").setDescription("Edad").setRequired(true))
      .addStringOption(o => o.setName("fecha").setDescription("Fecha nacimiento DD/MM/AAAA").setRequired(true))
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
      .toJSON()
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(client.user.id, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Comando /creardni registrado");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "creardni") {
    if (!interaction.member.roles.cache.has(ROL_PERMITIDO)) {
      return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });
    }

    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const fecha = interaction.options.getString("fecha");
    const sangre = interaction.options.getString("sangre");

    const idDNI = Math.floor(100000 + Math.random() * 900000);

    const embed = new EmbedBuilder()
      .setTitle("🆔 DNI - Los Santos RP")
      .setColor("DarkBlue")
      .addFields(
        { name: "Nombre", value: nombre, inline: true },
        { name: "Apellido", value: apellido, inline: true },
        { name: "Edad", value: edad.toString(), inline: true },
        { name: "Fecha Nacimiento", value: fecha, inline: true },
        { name: "Tipo de Sangre", value: sangre, inline: true },
        { name: "ID DNI", value: idDNI.toString(), inline: true }
      )
      .setFooter({ text: "Los Santos Spanish RP" })
      .setTimestamp();

    // Dar rol DNI
    const rol = interaction.guild.roles.cache.get(ROL_DNI);
    if (rol) {
      try {
        await interaction.member.roles.add(rol);
      } catch (e) {
        console.log("Error dando rol:", e);
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
