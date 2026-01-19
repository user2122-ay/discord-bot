const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDs del servidor y roles
const GUILD_ID = '1345956472986796183';
const CHANNEL_VERIFICACIONES = '1452365736927301764';
const ROL_CIUDADANO = '1451018397352595579';
const ROL_VERIFICADO = '1451018445998260266';
const ROL_NO_VERIFICADO = '1451018447482916904';

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comando /verificar
  const commands = [
    new SlashCommandBuilder()
      .setName('verificar')
      .setDescription('Inicia el proceso de verificación')
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
  if (interaction.commandName !== 'verificar') return;

  const preguntas = [
    { key: 'nombreOOC', text: '✏️ ¿Cuál es tu Nombre OOC?' },
    { key: 'edadOOC', text: '🎂 ¿Cuál es tu Edad OOC?' },
    { key: 'nombreIC', text: '📝 ¿Cuál es tu Nombre IC?' },
    { key: 'apellidoIC', text: '📝 ¿Cuál es tu Apellido IC?' },
    { key: 'edadIC', text: '🎂 ¿Cuál es tu Edad IC?' },
    { key: 'aceptaReglas', text: '✅ ¿Aceptas las reglas? (Si/No)' }
  ];

  const respuestas = {};
  let i = 0;

  await interaction.reply({ content: preguntas[i].text });

  const collector = interaction.channel.createMessageCollector({
    filter: m => m.author.id === interaction.user.id,
    time: 300000 // 5 minutos
  });

  collector.on('collect', async m => {
    respuestas[preguntas[i].key] = m.content.trim();
    i++;

    if (i < preguntas.length) {
      m.reply(preguntas[i].text);
    } else {
      collector.stop();

      // Crear embed
      const embed = new EmbedBuilder()
        .setTitle('📌 Solicitud de Verificación')
        .setDescription(`Usuario: <@${interaction.user.id}>`)
        .addFields(
          { name: 'Nombre OOC', value: respuestas.nombreOOC, inline: true },
          { name: 'Edad OOC', value: respuestas.edadOOC, inline: true },
          { name: 'Nombre IC', value: respuestas.nombreIC, inline: true },
          { name: 'Apellido IC', value: respuestas.apellidoIC, inline: true },
          { name: 'Edad IC', value: respuestas.edadIC, inline: true },
          { name: 'Acepta reglas', value: respuestas.aceptaReglas, inline: true }
        )
        .setColor('Blue');

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
      if (!staffChannel) return interaction.followUp({ content: '❌ No se encontró el canal de verificaciones.' });

      const mensajeStaff = await staffChannel.send({ embeds: [embed], components: [row] });
      await interaction.followUp({ content: '✅ Tu solicitud fue enviada al staff.' });

      // Collector de botones
      const filterBtn = i => ['aceptar', 'rechazar'].includes(i.customId) && i.user.id !== interaction.user.id;
      const collectorBtn = mensajeStaff.createMessageComponentCollector({ filter: filterBtn, max: 1, time: 600000 }); // 10 min

      collectorBtn.on('collect', async i => {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (i.customId === 'aceptar') {
          if (member) {
            try {
              if (member.manageable) await member.setNickname(`${respuestas.nombreIC} ${respuestas.apellidoIC}`);
              
              const rolVerificado = interaction.guild.roles.cache.get(ROL_VERIFICADO);
              const rolCivil = interaction.guild.roles.cache.get(ROL_CIUDADANO);
              const rolNoVerificado = interaction.guild.roles.cache.get(ROL_NO_VERIFICADO);

              if (rolVerificado && member.roles.highest.position < rolVerificado.position) await member.roles.add(rolVerificado).catch(console.log);
              if (rolCivil && member.roles.highest.position < rolCivil.position) await member.roles.add(rolCivil).catch(console.log);
              if (rolNoVerificado && member.roles.highest.position > rolNoVerificado.position) await member.roles.remove(rolNoVerificado).catch(console.log);

            } catch (e) {
              console.log('Error al cambiar roles/apodo:', e);
            }
          }
          await i.update({ content: '✅ Solicitud aceptada.', embeds: [], components: [] });
        } else {
          await i.update({ content: '❌ Solicitud rechazada.', embeds: [], components: [] });
        }
      });
    }
  });
});

client.login(process.env.TOKEN);                const rolCivil = interaction.guild.roles.cache.get(ROL_CIUDADANO);
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
      }
    });
  }
});

client.login(process.env.TOKEN);        { name: 'Edad OOC', value: edadOOC, inline: true },
        { name: 'Nombre IC', value: nombreIC, inline: true },
        { name: 'Apellido IC', value: apellidoIC, inline: true },
        { name: 'Edad IC', value: edadIC, inline: true },
        { name: 'Acepta reglas', value: reglas, inline: true }
      )
      .setColor('Blue');

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
    if (!staffChannel) return interaction.reply({ content: '❌ No se encontró el canal de verificaciones.', ephemeral: true });

    const mensajeStaff = await staffChannel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Tu solicitud fue enviada al staff.', ephemeral: true });

    // Collector botones
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
  }

});

client.login(process.env.TOKEN);    });
  }
});

client.login(process.env.TOKEN);
