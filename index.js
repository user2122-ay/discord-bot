const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dni')
        .setDescription('Muestra el DNI de un ciudadano')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario del que quieres ver el DNI')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        
        // Creamos el lienzo (Canvas)
        const canvas = Canvas.createCanvas(700, 400);
        const ctx = canvas.getContext('2d');

        // Fondo (puedes subir el logo o un fondo personalizado)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cabecera
        ctx.fillStyle = '#1e3a8a'; // Azul oscuro LSRP
        ctx.fillRect(0, 0, canvas.width, 80);

        // Texto
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('ESTADO DE LOS SANTOS', 120, 45);
        ctx.font = '15px sans-serif';
        ctx.fillText('DOCUMENTO DE IDENTIDAD', 120, 70);

        // Información ficticia (aquí conectarías con tu DB)
        ctx.font = '20px sans-serif';
        ctx.fillText(`NOMBRE: ${user.username.toUpperCase()}`, 250, 150);
        ctx.fillText(`ID: ${Math.floor(Math.random() * 900000)}`, 250, 190);
        ctx.fillText('NACIONALIDAD: LOS SANTOS', 250, 230);

        // Avatar del usuario
        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'jpg' }));
        ctx.drawImage(avatar, 50, 110, 150, 180);

        const attachment = new AttachmentBuilder(await canvas.toBuffer(), { name: 'dni-lsrp.png' });
        
        await interaction.reply({ files: [attachment] });
    },
};  askQuestion();
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
