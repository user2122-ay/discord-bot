const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../economia.json");

function loadData() {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({ users: {}, roles: {} }, null, 4));
    }

    const raw = fs.readFileSync(dataPath, "utf8");
    let data;

    try {
        data = JSON.parse(raw);
    } catch {
        data = { users: {}, roles: {} };
    }

    if (!data.users) data.users = {};
    if (!data.roles) data.roles = {};

    return data;
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
}

function ensureUser(data, userId) {
    if (!data.users[userId]) {
        data.users[userId] = { efectivo: 0, banco: 0, lastClaim: 0 };
    }
}

/* ================= BALANCE ================= */

module.exports.balance = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Ver tu dinero"),

    async execute(interaction) {

        const data = loadData();
        const userId = interaction.user.id;

        ensureUser(data, userId);
        saveData(data);

        const user = data.users[userId];

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🏦┃ESTADO FINANCIERO")
            .addFields(
                { name: "💵 Efectivo", value: `\`\`\`$${user.efectivo}\`\`\``, inline: true },
                { name: "🏦 Banco", value: `\`\`\`$${user.banco}\`\`\``, inline: true },
                { name: "📊 Total", value: `\`\`\`$${user.efectivo + user.banco}\`\`\`` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};

/* ================= AÑADIR SUELDO ================= */

module.exports["añadir-sueldo"] = {
    data: new SlashCommandBuilder()
        .setName("añadir-sueldo")
        .setDescription("Asignar sueldo a un rol")
        .addRoleOption(o =>
            o.setName("rol")
            .setDescription("Rol")
            .setRequired(true))
        .addIntegerOption(o =>
            o.setName("cantidad")
            .setDescription("Cantidad")
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const data = loadData();
        const rol = interaction.options.getRole("rol");
        const cantidad = interaction.options.getInteger("cantidad");

        data.roles[rol.id] = cantidad;
        saveData(data);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#f1c40f")
                    .setTitle("💼┃SUELDO ASIGNADO")
                    .addFields(
                        { name: "📛 Rol", value: `${rol}`, inline: true },
                        { name: "💰 Sueldo cada 6 días", value: `\`\`\`$${cantidad}\`\`\`` }
                    )
                    .setTimestamp()
            ]
        });
    }
};

/* ================= COBRAR ================= */

module.exports.cobrar = {
    data: new SlashCommandBuilder()
        .setName("cobrar")
        .setDescription("Cobrar tu sueldo"),

    async execute(interaction) {

        const data = loadData();
        const userId = interaction.user.id;

        ensureUser(data, userId);

        const user = data.users[userId];
        const cooldown = 6 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (now - user.lastClaim < cooldown)
            return interaction.reply({ content: "⏳ Aún no puedes cobrar (6 días).", ephemeral: true });

        let sueldoTotal = 0;

        interaction.member.roles.cache.forEach(role => {
            if (data.roles[role.id]) {
                sueldoTotal += data.roles[role.id];
            }
        });

        if (sueldoTotal <= 0)
            return interaction.reply({ content: "❌ No tienes rol con sueldo.", ephemeral: true });

        const impuesto = Math.floor(sueldoTotal * 0.10);
        const final = sueldoTotal - impuesto;

        user.efectivo += final;
        user.lastClaim = now;

        saveData(data);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#00ff88")
                    .setTitle("💼┃NÓMINA PROCESADA")
                    .addFields(
                        { name: "💰 Bruto", value: `\`\`\`$${sueldoTotal}\`\`\``, inline: true },
                        { name: "🏛️ Impuesto 10%", value: `\`\`\`-$${impuesto}\`\`\``, inline: true },
                        { name: "💵 Recibido", value: `\`\`\`$${final}\`\`\`` }
                    )
                    .setTimestamp()
            ]
        });
    }
};

/* ================= TOP DINERO ================= */

module.exports["top-dinero"] = {
    data: new SlashCommandBuilder()
        .setName("top-dinero")
        .setDescription("Ranking de los más ricos"),

    async execute(interaction) {

        const data = loadData();

        const usersArray = Object.entries(data.users)
            .map(([id, user]) => ({
                id,
                total: (user.efectivo || 0) + (user.banco || 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (!usersArray.length)
            return interaction.reply({ content: "❌ No hay datos.", ephemeral: true });

        let description = "━━━━━━━━━━━━━━━━━━\n\n";

        for (let i = 0; i < usersArray.length; i++) {

            const userData = usersArray[i];
            const member = await interaction.guild.members.fetch(userData.id).catch(() => null);
            const name = member ? member.user.username : "Usuario";

            let medal = ["🥇","🥈","🥉"][i] || "🏅";

            description += `${medal} **${i + 1}. ${name}**\n💰 $${userData.total}\n\n`;
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#ffd700")
                    .setTitle("🏆┃RANKING ECONÓMICO")
                    .setDescription(description)
                    .setTimestamp()
            ]
        });
    }
};

/* ================= TRANSFERIR ================= */

module.exports.transferir = {
    data: new SlashCommandBuilder()
        .setName("transferir")
        .setDescription("Transferir dinero a otro usuario")
        .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true)),

    async execute(interaction) {

        const data = loadData();
        const sender = interaction.user;
        const target = interaction.options.getUser("usuario");
        const cantidad = interaction.options.getInteger("cantidad");

        if (cantidad <= 0)
            return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

        ensureUser(data, sender.id);
        ensureUser(data, target.id);

        if (data.users[sender.id].efectivo < cantidad)
            return interaction.reply({ content: "❌ No tienes suficiente efectivo.", ephemeral: true });

        data.users[sender.id].efectivo -= cantidad;
        data.users[target.id].efectivo += cantidad;

        saveData(data);

        return interaction.reply(`💸 Transferiste $${cantidad} a ${target}`);
    }
};

/* ================= DEPOSITAR ================= */

module.exports.depositar = {
    data: new SlashCommandBuilder()
        .setName("depositar")
        .setDescription("Depositar dinero al banco")
        .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true)),

    async execute(interaction) {

        const data = loadData();
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        ensureUser(data, userId);

        if (cantidad <= 0)
            return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

        if (data.users[userId].efectivo < cantidad)
            return interaction.reply({ content: "❌ No tienes suficiente efectivo.", ephemeral: true });

        data.users[userId].efectivo -= cantidad;
        data.users[userId].banco += cantidad;

        saveData(data);

        return interaction.reply(`🏦 Depositaste $${cantidad} al banco.`);
    }
};

/* ================= RETIRAR ================= */

module.exports.retirar = {
    data: new SlashCommandBuilder()
        .setName("retirar")
        .setDescription("Retirar dinero del banco")
        .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true)),

    async execute(interaction) {

        const data = loadData();
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        ensureUser(data, userId);

        if (cantidad <= 0)
            return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

        if (data.users[userId].banco < cantidad)
            return interaction.reply({ content: "❌ No tienes suficiente en el banco.", ephemeral: true });

        data.users[userId].banco -= cantidad;
        data.users[userId].efectivo += cantidad;

        saveData(data);

        return interaction.reply(`💵 Retiraste $${cantidad} del banco.`);
    }
};

/* ================= AÑADIR DINERO ================= */

module.exports["añadir-dinero"] = {
    data: new SlashCommandBuilder()
        .setName("añadir-dinero")
        .setDescription("Añadir dinero a un usuario")
        .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const data = loadData();
        const target = interaction.options.getUser("usuario");
        const cantidad = interaction.options.getInteger("cantidad");

        ensureUser(data, target.id);

        data.users[target.id].efectivo += cantidad;

        saveData(data);

        return interaction.reply(`💰 Se añadieron $${cantidad} a ${target}`);
    }
};

/* ================= QUITAR DINERO ================= */

module.exports["quitar-dinero"] = {
    data: new SlashCommandBuilder()
        .setName("quitar-dinero")
        .setDescription("Quitar dinero a un usuario")
        .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const data = loadData();
        const target = interaction.options.getUser("usuario");
        const cantidad = interaction.options.getInteger("cantidad");

        ensureUser(data, target.id);

        data.users[target.id].efectivo -= cantidad;
        if (data.users[target.id].efectivo < 0)
            data.users[target.id].efectivo = 0;

        saveData(data);

        return interaction.reply(`💸 Se quitaron $${cantidad} a ${target}`);
    }
};
