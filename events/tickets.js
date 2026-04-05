module.exports = (client) => {

    client.on("interactionCreate", async interaction => {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "ticket_select") return;

        const categoria = interaction.values[0];
        const user = interaction.user;
        const guild = interaction.guild;

        // 🔢 CONTADOR SIMPLE
        const count = guild.channels.cache.filter(c => c.name.includes("ticket")).size + 1;
        const numero = String(count).padStart(3, "0");

        let nombre = "";
        let roles = [];

        if (categoria === "soporte" || categoria === "usuario") {
            nombre = `soporte-${numero}`;
            roles = ["1463192290423083324"];
        }

        if (categoria === "staff") {
            nombre = `staff-${numero}`;
            roles = ["1463192290444185650"];
        }

        if (categoria === "alianza") {
            nombre = `alianza-${numero}`;
            roles = ["1463192290410631451"];
        }

        if (categoria === "fundacion") {
            nombre = `fundacion-${numero}`;
            roles = [
                "1463192290456764545",
                "1463192290456764547"
            ];
        }

        const canal = await guild.channels.create({
            name: nombre,
            type: 0,
            permissionOverwrites: [
                { id: guild.id, deny: ["ViewChannel"] },
                { id: user.id, allow: ["ViewChannel", "SendMessages"] },
                ...roles.map(r => ({
                    id: r,
                    allow: ["ViewChannel", "SendMessages"]
                }))
            ]
        });

        // 📢 PING FUERA DEL EMBED
        const pings = roles.map(r => `<@&${r}>`).join(" ");

        await canal.send(`${pings} <@${user.id}>`);

        await canal.send({
            content: `🎫 Ticket creado correctamente.\nUn encargado te atenderá pronto.`
        });

        await interaction.reply({
            content: `✅ Ticket creado: ${canal}`,
            ephemeral: true
        });

    });

};
