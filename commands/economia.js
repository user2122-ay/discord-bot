const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require("discord.js");

const mysql = require("mysql2/promise");

// 🔥 CONEXIÓN DB
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "economia",
    waitForConnections: true,
    connectionLimit: 10
});

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
    "1463192290456764547",
    "1463192290456764545"
];

/* ================= FUNCIONES DB ================= */

async function ensureUser(userId) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
        await db.query(
            "INSERT INTO users (id, efectivo, banco, lastClaim) VALUES (?, 0, 0, 0)",
            [userId]
        );
    }
}

async function getUser(userId) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    return rows[0];
}

async function updateUser(userId, user) {
    await db.query(
        "UPDATE users SET efectivo = ?, banco = ?, lastClaim = ? WHERE id = ?",
        [user.efectivo, user.banco, user.lastClaim, userId]
    );
}

async function getRoles() {
    const [rows] = await db.query("SELECT * FROM roles");
    return rows;
}

async function setRole(roleId, sueldo) {
    await db.query(
        "INSERT INTO roles (role_id, sueldo) VALUES (?, ?) ON DUPLICATE KEY UPDATE sueldo = ?",
        [roleId, sueldo, sueldo]
    );
}

/* ================= BALANCE ================= */

module.exports.balance = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Ver tu dinero"),

    async execute(interaction) {
        const userId = interaction.user.id;

        await ensureUser(userId);
        const user = await getUser(userId);

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
    permisos: "👑 Fundación",
    data: new SlashCommandBuilder()
        .setName("añadir-sueldo")
        .setDescription("Asignar sueldo a un rol")
        .addRoleOption(o => o.setName("rol").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
        if (!tieneRol) return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });

        const rol = interaction.options.getRole("rol");
        const cantidad = interaction.options.getInteger("cantidad");

        await setRole(rol.id, cantidad);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#f1c40f")
                    .setTitle("💼┃SUELDO ASIGNADO")
                    .addFields(
                        { name: "📛 Rol", value: `${rol}`, inline: true },
                        { name: "💰 Sueldo", value: `\`\`\`$${cantidad}\`\`\`` }
                    )
            ]
        });
    }
};

/* ================= COBRAR ================= */

module.exports.cobrar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("cobrar")
        .setDescription("Cobrar tu sueldo"),

    async execute(interaction) {
        const userId = interaction.user.id;

        await ensureUser(userId);
        const user = await getUser(userId);

        const cooldown = 6 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        if (now - user.lastClaim < cooldown)
            return interaction.reply({ content: "⏳ Espera 6 días.", ephemeral: true });

        const rolesDB = await getRoles();
        let sueldoTotal = 0;

        interaction.member.roles.cache.forEach(role => {
            const r = rolesDB.find(x => x.role_id === role.id);
            if (r) sueldoTotal += Number(r.sueldo);
        });

        if (sueldoTotal <= 0)
            return interaction.reply({ content: "❌ No tienes sueldo.", ephemeral: true });

        const impuesto = Math.floor(sueldoTotal * 0.10);
        const final = sueldoTotal - impuesto;

        user.efectivo += final;
        user.lastClaim = now;

        await updateUser(userId, user);

        return interaction.reply(`💰 Recibiste $${final}`);
    }
};

/* ================= TRANSFERIR ================= */

module.exports.transferir = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("transferir")
        .setDescription("Transferir dinero")
        .addUserOption(o => o.setName("usuario").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setRequired(true)),

    async execute(interaction) {
        const senderId = interaction.user.id;
        const target = interaction.options.getUser("usuario");
        const cantidad = interaction.options.getInteger("cantidad");

        if (cantidad <= 0)
            return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

        await ensureUser(senderId);
        await ensureUser(target.id);

        const sender = await getUser(senderId);
        const receiver = await getUser(target.id);

        if (sender.efectivo < cantidad)
            return interaction.reply({ content: "❌ No tienes dinero.", ephemeral: true });

        sender.efectivo -= cantidad;
        receiver.efectivo += cantidad;

        await updateUser(senderId, sender);
        await updateUser(target.id, receiver);

        return interaction.reply(`💸 Transferiste $${cantidad}`);
    }
};

/* ================= DEPOSITAR ================= */

module.exports.depositar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("depositar")
        .setDescription("Depositar")
        .addIntegerOption(o => o.setName("cantidad").setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        await ensureUser(userId);
        const user = await getUser(userId);

        if (user.efectivo < cantidad)
            return interaction.reply({ content: "❌ No tienes dinero.", ephemeral: true });

        user.efectivo -= cantidad;
        user.banco += cantidad;

        await updateUser(userId, user);

        return interaction.reply(`🏦 Depositaste $${cantidad}`);
    }
};

/* ================= RETIRAR ================= */

module.exports.retirar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("retirar")
        .setDescription("Retirar")
        .addIntegerOption(o => o.setName("cantidad").setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        await ensureUser(userId);
        const user = await getUser(userId);

        if (user.banco < cantidad)
            return interaction.reply({ content: "❌ No tienes banco.", ephemeral: true });

        user.banco -= cantidad;
        user.efectivo += cantidad;

        await updateUser(userId, user);

        return interaction.reply(`💵 Retiraste $${cantidad}`);
    }
};
