const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ID del servidor
const GUILD_ID = '1345956472986796183'; // tu servidor

// IDs de tu servidor
const CHANNEL_VERIFICACIONES = '1452365736927301764'; // canal de verificaciones
const ROL_CIUDADANO = '1451018397352595579';          // rol Civil
const ROL_VERIFICADO = '1451018445998260266';         // rol Verificado
const ROL_NO_VERIFICADO = '1451018447482916904';      // rol No Verificado

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comando de barra /verificar
  const commands = [
    new SlashCommandBuilder()
      .setName('verificar')
      .setDescription('Inicia el proceso de verificación de un usuario')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('✅ Comando /verificar registrado correctamente');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'verificar') {
    await interaction.reply({
      content: 'Por favor responde las siguientes preguntas separadas por comas: Nombre OOC, Edad OOC, Nombre IC, Apellido IC, Edad IC, Si/No acepta reglas',
      ephemeral: true
    });

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async m => {
      const respuestas = m.content.split(',').map(r => r.trim());
      if (respuestas.length < 6) {
        return interaction.followUp({ content: '❌ Debes responder todas las preguntas separadas por comas.', ephemeral: true });
      }

      const [nombreOOC, edadOOC, nombreIC, apellidoIC, edadIC, reglas] = respuestas;

      // Embed para staff
      const embed = new EmbedBuilder()
        .setTitle('Solicitud de Verificación')
        .setDescription(`Usuario: <@${interaction.user.id}>`)
        .addFields(
          { name: 'Nombre OOC', value: nombreOOC, inline: true },
          { name: 'Edad OOC', value: edadOOC, inline: true },
          { name: 'Nombre IC', value: nombreIC, inline: true },
          { name: 'Apellido IC', value: apellidoIC, inline: true },
          { name: 'Edad IC', value: edadIC, inline: true },
          { name: 'Acepta reglas', value: reglas, inline: true }
        )
        .setColor('Blue');

      // Botones de aceptación/rechazo
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('aceptar')
          .setLabel('Aceptar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('rechazar')
          .setLabel('Rechazar')
          .setStyle(ButtonStyle.Danger)
      );

      const staffChannel = interaction.guild.channels.cache.get(CHANNEL_VERIFICACIONES);
      if (!staffChannel) return interaction.followUp({ content: '❌ No se encontró el canal de verificaciones.', ephemeral: true });

      const mensajeStaff = await staffChannel.send({ embeds: [embed], components: [row] });
      interaction.followUp({ content: '✅ Tu solicitud fue enviada al staff.', ephemeral: true });

      // Collector de botones
      const filterBtn = i => ['aceptar', 'rechazar'].includes(i.customId) && i.user.id !== interaction.user.id;
      const collectorBtn = mensajeStaff.createMessageComponentCollector({ filter: filterBtn, max: 1, time: 86400000 });

      collectorBtn.on('collect', async i => {
        if (i.customId === 'aceptar') {
          const member = interaction.guild.members.cache.get(interaction.user.id);
          if (member) {
            try {
              await member.setNickname(`${nombreIC} ${apellidoIC}`);
              const rolVerificado = interaction.guild.roles.cache.get(ROL_VERIFICADO);
              const rolCivil = interaction.guild.roles.cache.get(ROL_CIUDADANO);
              const rolNoVerificado = interaction.guild.roles.cache.get(ROL_NO_VERIFICADO);
              if (rolVerificado) await member.roles.add(rolVerificado);
              if (rolCivil) await member.roles.add(rolCivil);
              if (rolNoVerificado) await member.roles.remove(rolNoVerificado);
            } catch (e) {
              console.log('Error al cambiar roles/apodo', e);
            }
          }
          await i.update({ content: '✅ Solicitud aceptada.', embeds: [], components: [] });
        } else {
          await i.update({ content: '❌ Solicitud rechazada.', embeds: [], components: [] });
        }
      });
    });
  }
});

client.login(process.env.TOKEN);
