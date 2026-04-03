const {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} = require("discord.js");

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
"1463192290456764547",
"1463192290456764545"
];

// ================= DB HELPER =================

async function ensureUser(db, userId) {
  await db.query(
    `INSERT INTO ECONOMIA_LS_V2 (discord_id, cash, bank, last_pay)
     VALUES ($1, 0, 0, 0)
     ON CONFLICT (discord_id) DO NOTHING`,
    [userId]
  );
}

/* ================= BALANCE ================= */

module.exports.balance = {
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("balance")
.setDescription("Ver tu dinero"),

async execute(interaction) {
    const db = interaction.pool;
    const userId = interaction.user.id;

    await ensureUser(db, userId);

    const res = await db.query(
        "SELECT cash, bank FROM ECONOMIA_LS_V2 WHERE discord_id = $1",
        [userId]
    );

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
    const db = interaction.pool;

    const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
    if (!tieneRol) {
        return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const rol = interaction.options.getRole("rol");
    const cantidad = interaction.options.getInteger("cantidad");

    await db.query(
        `INSERT INTO SUELDOS_LS (role_id, sueldo)
         VALUES ($1, $2)
         ON CONFLICT (role_id) DO UPDATE SET sueldo = EXCLUDED.sueldo`,
        [rol.id, cantidad]
    );

    return interaction.reply(`💼 Sueldo asignado a ${rol}`);
}

};

/* ================= COBRAR ================= */

module.exports.cobrar = {
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("cobrar")
.setDescription("Cobrar tu sueldo"),

async execute(interaction) {
    const db = interaction.pool;
    const userId = interaction.user.id;

    await ensureUser(db, userId);

    const cooldown = 6 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const userRes = await db.query(
        "SELECT last_pay FROM ECONOMIA_LS_V2 WHERE discord_id = $1",
        [userId]
    );

    const lastPay = userRes.rows[0].last_pay;

    if (now - lastPay < cooldown)
        return interaction.reply({ content: "⏳ Aún no puedes cobrar.", ephemeral: true });

    let sueldoTotal = 0;

    for (const role of interaction.member.roles.cache.values()) {
        const roleRes = await db.query(
            "SELECT sueldo FROM SUELDOS_LS WHERE role_id = $1",
            [role.id]
        );

        if (roleRes.rows.length > 0) {
            sueldoTotal += Number(roleRes.rows[0].sueldo);
        }
    }

    const impuesto = Math.floor(sueldoTotal * 0.10);
    const final = sueldoTotal - impuesto;

    await db.query(
        `UPDATE ECONOMIA_LS_V2
         SET cash = cash + $1, last_pay = $2
         WHERE discord_id = $3`,
        [final, now, userId]
    );

    return interaction.reply(`💼 Cobraste $${final}`);
}

};

/* ================= TOP DINERO ================= */

module.exports["top-dinero"] = {
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("top-dinero")
.setDescription("Ranking de los más ricos"),

async execute(interaction) {
    const db = interaction.pool;

    const res = await db.query("SELECT discord_id, cash, bank FROM ECONOMIA_LS_V2");

    const usersArray = res.rows
        .map(u => ({
            id: u.discord_id,
            total: Number(u.cash) + Number(u.bank)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    let description = "";

    for (let i = 0; i < usersArray.length; i++) {
        const member = await interaction.guild.members.fetch(usersArray[i].id).catch(() => null);
        const name = member ? member.user.username : "Usuario";

        description += `${i + 1}. ${name} - $${usersArray[i].total}\n`;
    }

    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("🏆┃RANKING")
                .setDescription(description)
        ]
    });
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
    const db = interaction.pool;

    const sender = interaction.user;
    const target = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(db, sender.id);
    await ensureUser(db, target.id);

    await db.query("UPDATE ECONOMIA_LS_V2 SET cash = cash - $1 WHERE discord_id = $2", [cantidad, sender.id]);
    await db.query("UPDATE ECONOMIA_LS_V2 SET cash = cash + $1 WHERE discord_id = $2", [cantidad, target.id]);

    return interaction.reply(`💸 Transferiste $${cantidad} a ${target}`);
}

};

/* ================= DEPOSITAR ================= */

module.exports.depositar = {
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("depositar")
.setDescription("Depositar dinero")
.addIntegerOption(o => o.setName("cantidad").setRequired(true)),

async execute(interaction) {
    const db = interaction.pool;
    const userId = interaction.user.id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(db, userId);

    await db.query(
        "UPDATE ECONOMIA_LS_V2 SET cash = cash - $1, bank = bank + $1 WHERE discord_id = $2",
        [cantidad, userId]
    );

    return interaction.reply(`🏦 Depositaste $${cantidad}`);
}

};

/* ================= RETIRAR ================= */

module.exports.retirar = {
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("retirar")
.setDescription("Retirar dinero")
.addIntegerOption(o => o.setName("cantidad").setRequired(true)),

async execute(interaction) {
    const db = interaction.pool;
    const userId = interaction.user.id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(db, userId);

    await db.query(
        "UPDATE ECONOMIA_LS_V2 SET bank = bank - $1, cash = cash + $1 WHERE discord_id = $2",
        [cantidad, userId]
    );

    return interaction.reply(`💵 Retiraste $${cantidad}`);
}

};

/* ================= AÑADIR DINERO ================= */

module.exports["añadir-dinero"] = {
permisos: "👑 Fundación",
data: new SlashCommandBuilder()
.setName("añadir-dinero")
.setDescription("Añadir dinero a un usuario")
.addUserOption(o => o.setName("usuario").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {
    const db = interaction.pool;

    const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
    if (!tieneRol) {
        return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const target = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(db, target.id);

    await db.query(
        "UPDATE ECONOMIA_LS_V2 SET cash = cash + $1 WHERE discord_id = $2",
        [cantidad, target.id]
    );

    return interaction.reply(`💰 Se añadieron $${cantidad} a ${target}`);
}

};

/* ================= QUITAR DINERO ================= */

module.exports["quitar-dinero"] = {
permisos: "👑 Fundación",
data: new SlashCommandBuilder()
.setName("quitar-dinero")
.setDescription("Quitar dinero a un usuario")
.addUserOption(o => o.setName("usuario").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {
    const db = interaction.pool;

    const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
    if (!tieneRol) {
        return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const target = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(db, target.id);

    await db.query(
        "UPDATE ECONOMIA_LS_V2 SET cash = GREATEST(cash - $1, 0) WHERE discord_id = $2",
        [cantidad, target.id]
    );

    return interaction.reply(`💸 Se quitaron $${cantidad} a ${target}`);
}

};
