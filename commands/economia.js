const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { Pool } = require("pg");

// 🔌 CONEXIÓN POSTGRES
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
    "1463192290456764547",
    "1463192290456764545"
];

/* ================= FUNCIONES ================= */

async function ensureUser(userId) {
    const res = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);

    if (res.rows.length === 0) {
        await pool.query(
            "INSERT INTO economia_ls_v2 (discord_id, cash, bank, last_pay) VALUES ($1, 0, 0, 0)",
            [userId]
        );
    }
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

        const res = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);
        const user = res.rows[0];

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🏦┃ESTADO FINANCIERO")
            .addFields(
                { name: "💵 Efectivo", value: `\`\`\`$${user.cash}\`\`\``, inline: true },
                { name: "🏦 Banco", value: `\`\`\`$${user.bank}\`\`\``, inline: true },
                { name: "📊 Total", value: `\`\`\`$${user.cash + user.bank}\`\`\`` }
            );

        return interaction.reply({ embeds: [embed] });
    }
};

/* ================= COBRAR SUELDO ================= */

module.exports.cobrar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("cobrar")
        .setDescription("Cobrar sueldo"),

    async execute(interaction) {
        const userId = interaction.user.id;

        await ensureUser(userId);

        const userRes = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);
        const user = userRes.rows[0];

        const now = Date.now();
        const cooldown = 6 * 24 * 60 * 60 * 1000;

        if (now - user.last_pay < cooldown)
            return interaction.reply({ content: "⏳ Espera 6 días.", ephemeral: true });

        let sueldoTotal = 0;

        const rolesRes = await pool.query("SELECT * FROM sueldos_ls");

        interaction.member.roles.cache.forEach(role => {
            const sueldo = rolesRes.rows.find(r => r.role_id === role.id);
            if (sueldo) sueldoTotal += sueldo.sueldo;
        });

        if (sueldoTotal <= 0)
            return interaction.reply({ content: "❌ No tienes sueldo.", ephemeral: true });

        const impuesto = Math.floor(sueldoTotal * 0.10);
        const final = sueldoTotal - impuesto;

        await pool.query(
            "UPDATE economia_ls_v2 SET cash = cash + $1, last_pay = $2 WHERE discord_id = $3",
            [final, now, userId]
        );

        return interaction.reply(`💰 Cobraste $${final}`);
    }
};

/* ================= DEPOSITAR ================= */

module.exports.depositar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("depositar")
        .addIntegerOption(o => o.setName("cantidad").setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        await ensureUser(userId);

        const res = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);
        const user = res.rows[0];

        if (user.cash < cantidad)
            return interaction.reply("❌ No tienes dinero.");

        await pool.query(
            "UPDATE economia_ls_v2 SET cash = cash - $1, bank = bank + $1 WHERE discord_id = $2",
            [cantidad, userId]
        );

        interaction.reply(`🏦 Depositaste $${cantidad}`);
    }
};

/* ================= RETIRAR ================= */

module.exports.retirar = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("retirar")
        .addIntegerOption(o => o.setName("cantidad").setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cantidad = interaction.options.getInteger("cantidad");

        await ensureUser(userId);

        const res = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);
        const user = res.rows[0];

        if (user.bank < cantidad)
            return interaction.reply("❌ No tienes banco.");

        await pool.query(
            "UPDATE economia_ls_v2 SET bank = bank - $1, cash = cash + $1 WHERE discord_id = $2",
            [cantidad, userId]
        );

        interaction.reply(`💵 Retiraste $${cantidad}`);
    }
};

/* ================= CASINO (SLOTS) ================= */

module.exports.slots = {
    permisos: "🌐 Todos",
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Casino slots")
        .addIntegerOption(o => o.setName("apuesta").setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const apuesta = interaction.options.getInteger("apuesta");

        await ensureUser(userId);

        const res = await pool.query("SELECT * FROM economia_ls_v2 WHERE discord_id = $1", [userId]);
        const user = res.rows[0];

        if (user.cash < apuesta)
            return interaction.reply("❌ No tienes dinero.");

        const emojis = ["🍒","🍋","🍉","💎","7️⃣"];
        const roll = [
            emojis[Math.floor(Math.random()*emojis.length)],
            emojis[Math.floor(Math.random()*emojis.length)],
            emojis[Math.floor(Math.random()*emojis.length)]
        ];

        let win = 0;

        if (roll[0] === roll[1] && roll[1] === roll[2]) {
            win = apuesta * 5;
        } else if (roll[0] === roll[1] || roll[1] === roll[2]) {
            win = apuesta * 2;
        }

        let result = -apuesta + win;

        await pool.query(
            "UPDATE economia_ls_v2 SET cash = cash + $1 WHERE discord_id = $2",
            [result, userId]
        );

        interaction.reply(`🎰 ${roll.join(" | ")}\n💰 Resultado: $${result}`);
    }
};

/* ================= AÑADIR SUELDO ================= */

module.exports["añadir-sueldo"] = {
    permisos: "👑 Fundación",
    data: new SlashCommandBuilder()
        .setName("añadir-sueldo")
        .addRoleOption(o => o.setName("rol").setRequired(true))
        .addIntegerOption(o => o.setName("cantidad").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
        if (!tieneRol) return interaction.reply("❌ No permiso");

        const rol = interaction.options.getRole("rol");
        const cantidad = interaction.options.getInteger("cantidad");

        await pool.query(
            "INSERT INTO sueldos_ls (role_id, sueldo) VALUES ($1, $2)",
            [rol.id, cantidad]
        );

        interaction.reply(`💼 Sueldo asignado`);
    }
};
