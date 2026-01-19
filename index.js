const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Roles y servidor
const GUILD_ID = '1345956472986796183';
const ROL_PERMITIDO = '1451018445998260266'; // puede crear DNI
const ROL_DNI = '1451018398874996966'; // rol que se da al crear DNI

// Guardar los DNI en memoria
const DNIs = new Map();

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('crearDNI')
      .setDescription('Crea un DNI para un ciudadano')
      .toJSON(),
    new SlashCommandBuilder()
      .setName('verDNI')
      .setDescription('Ver DNI de un usuario')
      .addUserOption(option => 
        option.setName('usuario')
              .setDescription('Usuario a consultar')
              .setRequired(true)
      )
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('✅ Comandos de DNI registrados correctamente');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const member = interaction.member;

  // ==================== CREAR DNI ====================
  if (interaction.commandName === 'crearDNI') {

    if (!member.roles.cache.has(ROL_PERMITIDO)) {
      return interaction.reply({ content: '❌ No tienes permiso para crear DNI.', ephemeral: true });
    }

    const preguntas = [
      { key: 'nombre', text: '✏️ Ingresa el nombre:' },
      { key: 'apellido', text: '✏️ Ingresa el apellido:' },
      { key: 'edad', text: '🎂 Ingresa la edad:' },
      { key: 'fechaNac', text: '📅 Ingresa la fecha de nacimiento (DD/MM/AAAA):' }
    ];

    const respuestas = {};
    let index = 0;

    await interaction.reply({ content: preguntas[index].text, ephemeral: true });

    const collector = interaction.channel.createMessageCollector({
      filter: m => m.author.id === member.id,
      time: 300000
    });

    collector.on('collect', async m => {
      respuestas[preguntas[index].key] = m.content.trim();
      index++;

      if (index < preguntas.length) {
        m.reply(preguntas[index].text);
      } else {
        collector.stop();

        // Preguntar tipo de sangre con menú
        const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('tipoSangre')
            .setPlaceholder('Selecciona el tipo de sangre')
            .addOptions(
              tiposSangre.map(tipo => ({ label: tipo, value: tipo }))
            )
        );

        const msg = await interaction.followUp({ content: '💉 Selecciona el tipo de sangre:', components: [row], ephemeral: true });

        const menuCollector = msg.createMessageComponentCollector({ time: 60000, max: 1 });

        menuCollector.on('collect', async i => {
          respuestas.tipoSangre = i.values[0];
          await i.update({ content: '✅ Tipo de sangre seleccionado.', components: [] });

          // Generar número de ID aleatorio
          const numeroID = Math.floor(Math.random() * 900000 + 100000);

          // Guardar DNI
          DNIs.set(member.id, {
            nombre: respuestas.nombre,
            apellido: respuestas.apellido,
            edad: respuestas.edad,
            fechaNac: respuestas.fechaNac,
            tipoSangre: respuestas.tipoSangre,
            numeroID
          });

          // Crear embed
          const embed = new EmbedBuilder()
            .setTitle('🆔 DNI Ciudadano')
            .setDescription(`DNI creado por <@${member.id}>`)
            .addFields(
              { name: 'Nombre', value: respuestas.nombre, inline: true },
              { name: 'Apellido', value: respuestas.apellido, inline: true },
              { name: 'Edad', value: respuestas.edad, inline: true },
              { name: 'Fecha de nacimiento', value: respuestas.fechaNac, inline: true },
              { name: 'Tipo de sangre', value: respuestas.tipoSangre, inline: true },
              { name: 'Número de ID', value: numeroID.toString(), inline: true }
            )
            .setColor('Green')
            .setTimestamp();

          await interaction.followUp({ embeds: [embed], ephemeral: false });

          // Dar rol al usuario
          const rolDni = interaction.guild.roles.cache.get(ROL_DNI);
          if (rolDni) {
            try { await member.roles.add(rolDni); } catch (e) { console.log('Error al dar rol DNI', e); }
          }
        });
      }
    });
  }

  // ==================== VER DNI ====================
  if (interaction.commandName === 'verDNI') {
    const usuario = interaction.options.getUser('usuario');
    const dni = DNIs.get(usuario.id);

    if (!dni) return interaction.reply({ content: '❌ Este usuario no tiene DNI.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(`🆔 DNI de ${usuario.username}`)
      .addFields(
        { name: 'Nombre', value: dni.nombre, inline: true },
        { name: 'Apellido', value: dni.apellido, inline: true },
        { name: 'Edad', value: dni.edad, inline: true },
        { name: 'Fecha de nacimiento', value: dni.fechaNac, inline: true },
        { name: 'Tipo de sangre', value: dni.tipoSangre, inline: true },
        { name: 'Número de ID', value: dni.numeroID.toString(), inline: true }
      )
      .setColor('Blue')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(process.env.TOKEN);                if (rolCivil) await member.roles.add(rolCivil);
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
