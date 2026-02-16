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

        if (!data.roles) data.roles = {};

        data.roles[rol.id] = cantidad;
        saveData(data);

        const embed = new EmbedBuilder()
            .setColor("#f1c40f")
            .setTitle("💼┃SUELDO ASIGNADO")
            .addFields(
                { name: "📛 Rol", value: `${rol}`, inline: true },
                { name: "💰 Sueldo cada 6 días", value: `\`\`\`$${cantidad}\`\`\`` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
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

        if (now - user.lastClaim < cooldown) {
            return interaction.reply({ content: "⏳ Aún no puedes cobrar (6 días).", ephemeral: true });
        }

        let sueldoTotal = 0;

        if (!data.roles) data.roles = {};

        interaction.member.roles.cache.forEach(role => {
            if (data.roles[role.id]) {
                sueldoTotal += data.roles[role.id];
            }
        });

        if (sueldoTotal <= 0) {
            return interaction.reply({ content: "❌ No tienes rol con sueldo.", ephemeral: true });
        }

        const impuesto = Math.floor(sueldoTotal * 0.10);
        const final = sueldoTotal - impuesto;

        user.efectivo += final;
        user.lastClaim = now;

        saveData(data);

        const embed = new EmbedBuilder()
            .setColor("#00ff88")
            .setTitle("💼┃NÓMINA PROCESADA")
            .addFields(
                { name: "💰 Bruto", value: `\`\`\`$${sueldoTotal}\`\`\``, inline: true },
                { name: "🏛️ Impuesto 10%", value: `\`\`\`-$${impuesto}\`\`\``, inline: true },
                { name: "💵 Recibido", value: `\`\`\`$${final}\`\`\`` }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};

/* ================= TOP DINERO ================= */

module.exports["top-dinero"] = {
    data: new SlashCommandBuilder()
        .setName("top-dinero")
        .setDescription("Ranking de los más ricos"),

    async execute(interaction) {

        const data = loadData();

        if (!data.users) data.users = {};

        const usersArray = Object.entries(data.users)
            .map(([id, user]) => ({
                id,
                total: (user.efectivo || 0) + (user.banco || 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        if (!usersArray.length) {
            return interaction.reply({ content: "❌ No hay datos.", ephemeral: true });
        }

        let description = "━━━━━━━━━━━━━━━━━━\n\n";

        for (let i = 0; i < usersArray.length; i++) {

            const userData = usersArray[i];
            const member = await interaction.guild.members.fetch(userData.id).catch(() => null);
            const name = member ? member.user.username : "Usuario";

            let medal = "🏅";
            if (i === 0) medal = "🥇";
            if (i === 1) medal = "🥈";
            if (i === 2) medal = "🥉";

            description += `${medal} **${i + 1}. ${name}**\n💰 $${userData.total}\n\n`;
        }

        const embed = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle("🏆┃RANKING ECONÓMICO")
            .setDescription(description)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
