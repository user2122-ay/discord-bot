const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName("kiss")
.setDescription("Dale un beso a alguien 💋")
.addUserOption(option =>
option.setName("usuario")
.setDescription("Usuario a besar")
.setRequired(true)
),

async execute(interaction) {

const autor = interaction.user;
const target = interaction.options.getUser("usuario");

if (target.id === autor.id) {
return interaction.reply({
content: "🤨 No puedes besarte a ti mismo...",
ephemeral: true
});
}

const frases = [
"💋 le dio un beso a",
"😘 besó tiernamente a",
"❤️ le robó un beso a",
"😚 besó suavemente a",
"🔥 besó apasionadamente a"
];

const frase = frases[Math.floor(Math.random() * frases.length)];

const embed = new EmbedBuilder()
.setColor("#ff69b4")
.setTitle("💋┃KISS")
.setDescription(`**${autor.username}** ${frase} **${target.username}** 💞`)
.setTimestamp();

return interaction.reply({ embeds: [embed] });

}
};
