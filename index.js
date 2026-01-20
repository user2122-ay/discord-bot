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
};
