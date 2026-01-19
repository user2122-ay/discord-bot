const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');

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
const CHANNEL_VERIFICACIONES = '1452365736927301764';

// Guardar DNI en memoria
const DNIs = new Map();

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comandos
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
    // Asegurarse de que sea en un guild
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ Este comando solo puede usarse en el servidor.', ephemeral: true });
    }

    if (!member.roles.cache.has(ROL_PERMITIDO)) {
      return interaction.reply({ content: '❌ No tienes permiso para crear DNI.', ephemeral: true });
    }

    // Preguntas
    const preguntas = [
      { key: 'nombre', text: '✏️ Ingresa el nombre:' },
      { key: 'apellido', text: '✏️ Ingresa el apellido:' },
      { key: 'edad', text: '🎂 Ingresa la edad (solo números):' },
      { key: 'fechaNac', text: '📅 Ingresa la fecha de nacimiento (DD/MM/AAAA):' },
      { key: 'tipoSangre', text: '💉 Ingresa el tipo de sangre (A+, A-, B+, B-, AB+, AB-, O+, O-):' }
    ];

    const respuestas = {};
    let index = 0;

    // Enviar primera pregunta visible en el canal donde se ejecutó
    try {
      await interaction.reply({ content: preguntas[index].text, ephemeral: false });
    } catch (err) {
      console.error('Error reply initial:', err);
      return;
    }

    const channel = interaction.channel;
    if (!channel) return; // por seguridad

    const filter = m => m.author.id === member.id && m.channelId === channel.id;

    const collector = channel.createMessageCollector({ filter, time: 300000 }); // 5 minutos

    collector.on('collect', async m => {
      try {
        const key = preguntas[index].key;
        let respuesta = m.content.trim();

        // Validar tipo de sangre
        if (key === 'tipoSangre') {
          const tipos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
          respuesta = respuesta.toUpperCase();
          if (!tipos.includes(respuesta)) {
            await m.reply('❌ Tipo de sangre inválido. Escribe uno de: A+, A-, B+, B-, AB+, AB-, O+, O-');
            return;
          }
        }

        // Validar edad
        if (key === 'edad') {
          const edadNum = parseInt(respuesta, 10);
          if (Number.isNaN(edadNum) || edadNum < 0 || edadNum > 150) {
            await m.reply('❌ Edad inválida. Escribe un número válido entre 0 y 150.');
            return;
          }
          respuesta = edadNum.toString();
        }

        // Validar fecha de nacimiento (DD/MM/AAAA)
        if (key === 'fechaNac') {
          const re = /^\d{2}\/\d{2}\/\d{4}$/;
          if (!re.test(respuesta)) {
            await m.reply('❌ Formato inválido. Usa DD/MM/AAAA (ej: 31/12/1990).');
            return;
          }
          // validación simple de día/mes (no años bisiestos avanzados)
          const [dd, mm, yyyy] = respuesta.split('/').map(x => parseInt(x, 10));
          if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1900 || yyyy > new Date().getFullYear()) {
            await m.reply('❌ Fecha inválida. Revisa día, mes y año.');
            return;
          }
        }

        respuestas[key] = respuesta;
        index++;

        if (index < preguntas.length) {
          await channel.send(preguntas[index].text);
        } else {
          collector.stop('completed');
        }
      } catch (err) {
        console.error('Error en collect handler:', err);
        collector.stop('error');
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        try {
          await channel.send(`<@${member.id}> ⏰ Se agotó el tiempo para completar el DNI. Vuelve a ejecutar el comando si quieres intentarlo de nuevo.`);
        } catch (e) { console.error(e); }
        return;
      }

      if (reason === 'error') {
        try {
          await channel.send(`<@${member.id}> ❌ Ocurrió un error durante la creación del DNI.`);
        } catch (e) { console.error(e); }
        return;
      }

      // Si no se completaron todas las respuestas
      if (index < preguntas.length) {
        try {
          await channel.send(`<@${member.id}> ❌ No completaste todas las preguntas. Vuelve a intentarlo.`);
        } catch (e) { console.error(e); }
        return;
      }

      // Generar ID aleatorio
      const numeroID = Math.floor(Math.random() * 900000 + 100000);

      // Guardar DNI
      DNIs.set(member.id, { ...respuestas, numeroID });

      // Embed bonito
      const embed = new EmbedBuilder()
        .setTitle('🆔 DNI Ciudadano')
        .setDescription(`DNI creado por <@${member.id}>`)
        .addFields(
          { name: 'Nombre', value: respuestas.nombre || 'N/A', inline: true },
          { name: 'Apellido', value: respuestas.apellido || 'N/A', inline: true },
          { name: 'Edad', value: respuestas.edad || 'N/A', inline: true },
          { name: 'Fecha de nacimiento', value: respuestas.fechaNac || 'N/A', inline: true },
          { name: 'Tipo de sangre', value: (respuestas.tipoSangre || 'N/A').toUpperCase(), inline: true },
          { name: 'Número de ID', value: numeroID.toString(), inline: true }
        )
        .setColor('Green')
        .setTimestamp();

      try {
        // Enviar embed al canal de verificaciones si existe, sino en el mismo canal
        const canalVerif = interaction.guild.channels.cache.get(CHANNEL_VERIFICACIONES);
        if (canalVerif) {
          await canalVerif.send({ embeds: [embed] });
        } else {
          await channel.send({ embeds: [embed] });
        }
      } catch (e) {
        console.error('Error al enviar embed:', e);
      }

      // Dar rol de DNI
      try {
        const rolDni = interaction.guild.roles.cache.get(ROL_DNI);
        if (rolDni) {
          await member.roles.add(rolDni);
        }
      } catch (e) {
        console.log('Error al dar rol DNI', e);
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
        { name: 'Nombre', value: dni.nombre || 'N/A', inline: true },
        { name: 'Apellido', value: dni.apellido || 'N/A', inline: true },
        { name: 'Edad', value: dni.edad || 'N/A', inline: true },
        { name: 'Fecha de nacimiento', value: dni.fechaNac || 'N/A', inline: true },
        { name: 'Tipo de sangre', value: (dni.tipoSangre || 'N/A').toUpperCase(), inline: true },
        { name: 'Número de ID', value: dni.numeroID.toString(), inline: true }
      )
      .setColor('Blue')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(process.env.TOKEN);          .setDescription(`DNI creado por <@${member.id}>`)
          .addFields(
            { name: 'Nombre', value: respuestas.nombre, inline: true },
            { name: 'Apellido', value: respuestas.apellido, inline: true },
            { name: 'Edad', value: respuestas.edad, inline: true },
            { name: 'Fecha de nacimiento', value: respuestas.fechaNac, inline: true },
            { name: 'Tipo de sangre', value: respuestas.tipoSangre.toUpperCase(), inline: true },
            { name: 'Número de ID', value: numeroID.toString(), inline: true }
          )
          .setColor('Green')
          .setTimestamp();

        await interaction.followUp({ embeds: [embed], ephemeral: false });

        // Dar rol de DNI
        const rolDni = interaction.guild.roles.cache.get(ROL_DNI);
        if (rolDni) {
          try { await member.roles.add(rolDni); } catch (e) { console.log('Error al dar rol DNI', e); }
        }
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
        { name: 'Tipo de sangre', value: dni.tipoSangre.toUpperCase(), inline: true },
        { name: 'Número de ID', value: dni.numeroID.toString(), inline: true }
      )
      .setColor('Blue')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(process.env.TOKEN);            nombre: respuestas.nombre,
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
