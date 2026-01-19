const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// IDs de tu servidor
const GUILD_ID = '1345956472986796183';
const CHANNEL_VERIFICACIONES = '1452365736927301764';
const ROL_CIUDADANO = '1451018397352595579';
const ROL_VERIFICADO = '1451018445998260266';
const ROL_NO_VERIFICADO = '1451018447482916904';

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comando de barra /verificar
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

  // ------------------- Slash command -------------------
  if (interaction.isCommand() && interaction.commandName === 'verificar') {

    // Crear modal
    const modal = new ModalBuilder()
      .setCustomId('modal_verificacion')
      .setTitle('Formulario de Verificación');

    // Campos del modal
    const nombreOOC = new TextInputBuilder()
      .setCustomId('nombreOOC')
      .setLabel('Nombre OOC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const edadOOC = new TextInputBuilder()
      .setCustomId('edadOOC')
      .setLabel('Edad OOC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nombreIC = new TextInputBuilder()
      .setCustomId('nombreIC')
      .setLabel('Nombre IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const apellidoIC = new TextInputBuilder()
      .setCustomId('apellidoIC')
      .setLabel('Apellido IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const edadIC = new TextInputBuilder()
      .setCustomId('edadIC')
      .setLabel('Edad IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const aceptaReglas = new TextInputBuilder()
      .setCustomId('aceptaReglas')
      .setLabel('¿Acepta las reglas? (Si/No)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    // Agregar campos al modal
    modal.addComponents(
      new ActionRowBuilder().addComponents(nombreOOC),
      new ActionRowBuilder().addComponents(edadOOC),
      new ActionRowBuilder().addComponents(nombreIC),
      new ActionRowBuilder().addComponents(apellidoIC),
      new ActionRowBuilder().addComponents(edadIC),
      new ActionRowBuilder().addComponents(aceptaReglas)
    );

    await interaction.showModal(modal);
  }

  // ------------------- Modal submit -------------------
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'modal_verificacion') {

    const nombreOOC = interaction.fields.getTextInputValue('nombreOOC');
    const edadOOC = interaction.fields.getTextInputValue('edadOOC');
    const nombreIC = interaction.fields.getTextInputValue('nombreIC');
    const apellidoIC = interaction.fields.getTextInputValue('apellidoIC');
    const edadIC = interaction.fields.getTextInputValue('edadIC');
    const reglas = interaction.fields.getTextInputValue('aceptaReglas');

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
