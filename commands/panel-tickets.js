const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} = require("discord.js");

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
    "1463192290456764547",
    "1463192290456764545"
];

module.exports["panel-tickets"] = {
    permisos: "👑 Fundación",

    data: new SlashCommandBuilder()
        .setName("panel-tickets")
        .setDescription("Enviar panel de tickets")
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Canal donde enviar el panel")
                .setRequired(true)
        ),

    async execute(interaction) {

        const tieneRol = interaction.member.roles.cache.some(r =>
            ROLES_FUNDACION.includes(r.id)
        );

        if (!tieneRol) {
            return interaction.reply({
                content: "❌ No tienes permiso.",
                ephemeral: true
            });
        }

        const canal = interaction.options.getChannel("canal");

        const embed = new EmbedBuilder()
            .setColor("#2c2f33")
            .setTitle("🎫┃SISTEMA DE TICKETS")
            .setDescription("Selecciona una categoría para crear tu ticket.");

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Selecciona categoría")
            .addOptions([
                { label: "Soporte General", value: "soporte" },
                { label: "Reportar Usuario", value: "usuario" },
                { label: "Reportar Staff", value: "staff" },
                { label: "Alianza", value: "alianza" },
                { label: "Soporte Fundación", value: "fundacion" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await canal.send({
            embeds: [embed],
            components: [row]
        });

        return interaction.reply({
            content: `✅ Panel enviado en ${canal}`,
            ephemeral: true
        });
    }
};
