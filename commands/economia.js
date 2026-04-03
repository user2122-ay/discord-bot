const {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} = require("discord.js");

const { Pool } = require("pg");

// 🔌 CONEXIÓN POSTGRES (Railway)
const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false }
});

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
"1463192290456764547",
"1463192290456764545"
];

// ✅ ASEGURAR USUARIO
async function ensureUser(userId) {
await pool.query(`
INSERT INTO ECONOMIA_LS_V2 (discord_id, cash, bank, last_pay)
VALUES ($1, 0, 0, 0)
ON CONFLICT (discord_id) DO NOTHING
`, [userId]);
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

const res = await pool.query(
"SELECT * FROM ECONOMIA_LS_V2 WHERE discord_id = $1",
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
.addRoleOption(o => o.setName("rol").setDescription("Rol").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {

const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));
if (!tieneRol)
return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });

const rol = interaction.options.getRole("rol");
const cantidad = interaction.options.getInteger("cantidad");

await pool.query(`
INSERT INTO SUELDOS_LS (role_id, sueldo)
VALUES ($1, $2)
ON CONFLICT (role_id)
DO UPDATE SET sueldo = $2
`, [rol.id, cantidad]);

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
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("cobrar")
.setDescription("Cobrar tu sueldo"),

async execute(interaction) {

const userId = interaction.user.id;
await ensureUser(userId);

const userRes = await pool.query(
"SELECT * FROM ECONOMIA_LS_V2 WHERE discord_id = $1",
[userId]
);

const user = userRes.rows[0];

const cooldown = 6 * 24 * 60 * 60 * 1000;
const now = Date.now();

if (now - user.last_pay < cooldown)
return interaction.reply({ content: "⏳ Aún no puedes cobrar (6 días).", ephemeral: true });

let sueldoTotal = 0;

for (const role of interaction.member.roles.cache.values()) {
const res = await pool.query(
"SELECT sueldo FROM SUELDOS_LS WHERE role_id = $1",
[role.id]
);
if (res.rows[0]) sueldoTotal += res.rows[0].sueldo;
}

if (sueldoTotal <= 0)
return interaction.reply({ content: "❌ No tienes rol con sueldo.", ephemeral: true });

const impuesto = Math.floor(sueldoTotal * 0.10);
const final = sueldoTotal - impuesto;

await pool.query(
"UPDATE ECONOMIA_LS_V2 SET cash = cash + $1, last_pay = $2 WHERE discord_id = $3",
[final, now, userId]
);

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
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("top-dinero")
.setDescription("Ranking de los más ricos"),

async execute(interaction) {

const res = await pool.query(`
SELECT * FROM ECONOMIA_LS_V2
ORDER BY (cash + bank) DESC
LIMIT 10
`);

if (!res.rows.length)
return interaction.reply({ content: "❌ No hay datos.", ephemeral: true });

let description = "━━━━━━━━━━━━━━━━━━\n\n";

for (let i = 0; i < res.rows.length; i++) {

const userData = res.rows[i];
const member = await interaction.guild.members.fetch(userData.discord_id).catch(() => null);
const name = member ? member.user.username : "Usuario";

let medal = ["🥇","🥈","🥉"][i] || "🏅";

description += `${medal} **${i + 1}. ${name}**\n💰 $${userData.cash + userData.bank}\n\n`;
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
permisos: "🌐 Todos",
data: new SlashCommandBuilder()
.setName("transferir")
.setDescription("Transferir dinero a otro usuario")
.addUserOption(o => o.setName("usuario").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setRequired(true)),

async execute(interaction) {

const sender = interaction.user.id;
const target = interaction.options.getUser("usuario").id;
const cantidad = interaction.options.getInteger("cantidad");

if (cantidad <= 0)
return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

await ensureUser(sender);
await ensureUser(target);

const res = await pool.query("SELECT cash FROM ECONOMIA_LS_V2 WHERE discord_id = $1", [sender]);

if (res.rows[0].cash < cantidad)
return interaction.reply({ content: "❌ No tienes suficiente efectivo.", ephemeral: true });

await pool.query("UPDATE ECONOMIA_LS_V2 SET cash = cash - $1 WHERE discord_id = $2", [cantidad, sender]);
await pool.query("UPDATE ECONOMIA_LS_V2 SET cash = cash + $1 WHERE discord_id = $2", [cantidad, target]);

return interaction.reply(`💸 Transferiste $${cantidad}`);
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

const userId = interaction.user.id;
const cantidad = interaction.options.getInteger("cantidad");

await ensureUser(userId);

const res = await pool.query("SELECT cash FROM ECONOMIA_LS_V2 WHERE discord_id = $1", [userId]);

if (res.rows[0].cash < cantidad)
return interaction.reply({ content: "❌ No tienes suficiente.", ephemeral: true });

await pool.query("UPDATE ECONOMIA_LS_V2 SET cash = cash - $1, bank = bank + $1 WHERE discord_id = $2", [cantidad, userId]);

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

const userId = interaction.user.id;
const cantidad = interaction.options.getInteger("cantidad");

await ensureUser(userId);

const res = await pool.query("SELECT bank FROM ECONOMIA_LS_V2 WHERE discord_id = $1", [userId]);

if (res.rows[0].bank < cantidad)
return interaction.reply({ content: "❌ No tienes suficiente.", ephemeral: true });

await pool.query("UPDATE ECONOMIA_LS_V2 SET bank = bank - $1, cash = cash + $1 WHERE discord_id = $2", [cantidad, userId]);

return interaction.reply(`💵 Retiraste $${cantidad}`);
}
};
/* ================= AÑADIR DINERO ================= */

module.exports["añadir-dinero"] = {
permisos: "👑 Fundación",
data: new SlashCommandBuilder()
.setName("añadir-dinero")
.setDescription("Añadir dinero a un usuario")
.addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {

const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));    
if (!tieneRol) {    
    return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });    
}    

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
permisos: "👑 Fundación",
data: new SlashCommandBuilder()
.setName("quitar-dinero")
.setDescription("Quitar dinero a un usuario")
.addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true))
.addIntegerOption(o => o.setName("cantidad").setDescription("Cantidad").setRequired(true))
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {

const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));    
if (!tieneRol) {    
    return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });    
}    

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
