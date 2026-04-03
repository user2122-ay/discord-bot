const {
SlashCommandBuilder,
EmbedBuilder,
PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

/* ================= BASE DE DATOS (NO AFECTA NADA) ================= */
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "economia",
    waitForConnections: true,
    connectionLimit: 10
});

// VARIABLES DB (solo referencia, no rompe nada)
// users: id (PK), efectivo (BIGINT), banco (BIGINT), lastClaim (BIGINT)
// roles: role_id (PK), sueldo (BIGINT)

async function initDB() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            efectivo BIGINT DEFAULT 0,
            banco BIGINT DEFAULT 0,
            lastClaim BIGINT DEFAULT 0
        )
    `);

    await db.query(`
        CREATE TABLE IF NOT EXISTS roles (
            role_id VARCHAR(50) PRIMARY KEY,
            sueldo BIGINT DEFAULT 0
        )
    `);
}

initDB();
/* ================= FIN DB ================= */

const dataPath = path.join(__dirname, "../economia.json");

// 🔒 ROLES FUNDACIÓN
const ROLES_FUNDACION = [
"1463192290456764547",
"1463192290456764545"
];

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
permisos: "🌐 Todos",
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
permisos: "👑 Fundación",
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

    const tieneRol = interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id));  
    if (!tieneRol) {  
        return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });  
    }  

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
permisos: "🌐 Todos",
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
