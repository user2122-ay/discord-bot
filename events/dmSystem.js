const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

// 📢 Canal donde se avisa al staff
const CANAL_AVISO = "1463192293111763118";

module.exports = (client) => {

    // 🧠 Evitar spam (1 panel por usuario cada cierto tiempo)
    const usuarios = new Set();

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;
        if (message.guild) return;

        // 🚫 evitar spam
        if (usuarios.has(message.author.id)) return;
        usuarios.add(message.author.id);

        setTimeout(() => usuarios.delete(message.author.id), 60000); // 1 min

        // 📌 EMBED
        const embed = new EmbedBuilder()
            .setColor("#2c2f33")
            .setTitle("🤖┃Soporte Automático")
            .setDescription(`Hola **${message.author.username}**, soy el asistente automático de **Los Santos RP**.

Selecciona una opción para ayudarte:

━━━━━━━━━━━━━━━━━━

❓ Dudas generales  
🎫 Crear ticket  
📜 Normativa  
📘 Conceptos RP  
🟢 Estado del servidor  
💬 Hablar con staff  

━━━━━━━━━━━━━━━━━━`)
            .setFooter({ text: "Sistema de Soporte • Los Santos RP" });

        // 📌 MENÚ
        const menu = new StringSelectMenuBuilder()
            .setCustomId("dm_menu")
            .setPlaceholder("Selecciona una opción")
            .addOptions([
                { label: "Dudas generales", value: "dudas", emoji: "❓" },
                { label: "Crear ticket", value: "ticket", emoji: "🎫" },
                { label: "Normativa", value: "normas", emoji: "📜" },
                { label: "Conceptos RP", value: "rp", emoji: "📘" },
                { label: "Estado del servidor", value: "estado", emoji: "🟢" },
                { label: "Hablar con staff", value: "staff", emoji: "💬" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.reply({
            embeds: [embed],
            components: [row]
        });

    });

    // 🎯 INTERACCIONES
    client.on("interactionCreate", async interaction => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "dm_menu") return;

        const opcion = interaction.values[0];

        if (opcion === "dudas") {
            return interaction.reply({
                content: "❓ Puedes escribir tu duda aquí y un miembro del staff te responderá pronto.",
                ephemeral: true
            });
        }

        if (opcion === "ticket") {
            return interaction.reply({
                content: "🎫 Crea tu ticket aquí:\nhttps://discord.com/channels/1463192289974157334/1463192291211477008",
                ephemeral: true
            });
        }

        if (opcion === "normas") {
            return interaction.reply({
                content: "📜 Normativa del servidor:\nhttps://discord.com/channels/1463192289974157334/1463192291056423017",
                ephemeral: true
            });
        }

        if (opcion === "rp") {
            return interaction.reply({
                content: "📘 Conceptos de Roleplay:\nhttps://discord.com/channels/1463192289974157334/1463192291056423019",
                ephemeral: true
            });
        }

        if (opcion === "estado") {
            return interaction.reply({
                content: "🟢 Estado y sesiones del servidor:\nhttps://discord.com/channels/1463192289974157334/1463192291056423024",
                ephemeral: true
            });
        }

        if (opcion === "staff") {

            // 📢 Aviso al staff
            const canal = client.channels.cache.get(CANAL_AVISO);

            if (canal) {
                canal.send({
                    content: `🚨 <@${interaction.user.id}> necesita ayuda en MD. Por favor contacten con él.`
                });
            }

            return interaction.reply({
                content: "💬 Hemos notificado al staff. Pronto se pondrán en contacto contigo.",
                ephemeral: true
            });
        }

    });

};
