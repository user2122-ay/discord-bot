const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDs de tu servidor
const GUILD_ID = '1345956472986796183';
const CHANNEL_VERIFICACIONES = '1452365736927301764';

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('verificar')
      .setDescription('Inicia la verificación (solo embed para staff)')
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
  if (!interaction.isCommand() || interaction.commandName !== 'verificar') return;

  await interaction.reply({ content: '📩 Te enviaré las preguntas aquí, responde paso a paso:', ephemeral: true });

  const preguntas = [
    { key: 'nombreOOC', text: '✏️ Nombre OOC:' },
    { key: 'edadOOC', text: '🎂 Edad OOC:' },
    { key: 'nombreIC', text: '📝 Nombre IC:' },
    { key: 'apellidoIC', text: '📝 Apellido IC:' },
    { key: 'edadIC', text: '🎂 Edad IC:' },
    { key: 'aceptaReglas', text: '✅ Acepta reglas (Si/No):' },
    { key: 'userRoblox', text: '🌐 Usuario de Roblox:' }
  ];

  const respuestas = {};
  let index = 0;

  const askQuestion = async () => {
    if (index < preguntas.length) {
      await interaction.followUp({ content: preguntas[index].text, ephemeral: true });
    } else {
      sendToStaff();
    }
  };

  const collector = interaction.channel.createMessageCollector({
    filter: m => m.author.id === interaction.user.id,
    time: 300000
  });

  collector.on('collect', m => {
    respuestas[preguntas[index].key] = m.content.trim();
    index++;
    askQuestion();
  });

  const sendToStaff = async () => {
    collector.stop();

    // Obtener avatar de Roblox
    let avatarUrl = 'https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png';
    try {
      const res = await fetch(`https://api.roblox.com/users/get-by-username?username=${respuestas.userRoblox}`);
      const data = await res.json();
      if (data && data.Id) {
        avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${data.Id}&width=150&height=150&format=png`;
      }
    } catch (e) {
      console.log('No se pudo obtener avatar de Roblox', e);
    }

    const embed = new EmbedBuilder()
      .setTitle('📌 Solicitud de Verificación')
      .setDescription(`Usuario: <@${interaction.user.id}>`)
      .addFields(
        { name: 'Nombre OOC', value: respuestas.nombreOOC, inline: true },
        { name: 'Edad OOC', value: respuestas.edadOOC, inline: true },
        { name: 'Nombre IC', value: respuestas.nombreIC, inline: true },
        { name: 'Apellido IC', value: respuestas.apellidoIC, inline: true },
        { name: 'Edad IC', value: respuestas.edadIC, inline: true },
        { name: 'Acepta reglas', value: respuestas.aceptaReglas, inline: true },
        { name: 'Usuario Roblox', value: respuestas.userRoblox, inline: true }
      )
      .setThumbnail(avatarUrl)
      .setColor('Blue');

    const staffChannel = interaction.guild.channels.cache.get(CHANNEL_VERIFICACIONES);
    if (!staffChannel) return interaction.followUp({ content: '❌ No se encontró el canal de verificaciones.', ephemeral: true });

    await staffChannel.send({ embeds: [embed] });
    await interaction.followUp({ content: '✅ Tu solicitud fue enviada al staff.', ephemeral: true });
  };

  // Inicia la primera pregunta
  askQuestion();
});

client.login(process.env.TOKEN);
      const mensajeStaff = await staffChannel.send({ embeds: [embed], components: [row] });
      dmChannel.send('✅ Tu solicitud fue enviada al staff.');

      // Collector de botones
      const filterBtn = i => ['aceptar', 'rechazar'].includes(i.customId) && i.user.id !== interaction.user.id;
      const collectorBtn = mensajeStaff.createMessageComponentCollector({ filter: filterBtn, max: 1, time: 600000 });

      collectorBtn.on('collect', async i => {
        const member = guild.members.cache.get(interaction.user.id);
        if (i.customId === 'aceptar') {
          if (member) {
            try {
              if (member.manageable) await member.setNickname(`${respuestas.nombreIC} ${respuestas.apellidoIC}`);
              const rolVerificado = guild.roles.cache.get(ROL_VERIFICADO);
              const rolCivil = guild.roles.cache.get(ROL_CIUDADANO);
              const rolNoVerificado = guild.roles.cache.get(ROL_NO_VERIFICADO);

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

client.login(process.env.TOKEN);            try {
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
