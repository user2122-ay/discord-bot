const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const ECONOMIA_FILE = './economia.json';
const SUELDOS_FILE = './sueldos.json';

const IMPUESTO = 0.10;
const BANCO_IMPUESTO = 0.02;
const COOLDOWN = 6 * 24 * 60 * 60 * 1000;
const STAFF_ROLE = "1472766576934649979";

function load(file) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
    return JSON.parse(fs.readFileSync(file));
}

function save(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getUser(data, id) {
    if (!data[id]) {
        data[id] = {
            efectivo: 0,
            banco: 0,
            lastClaim: 0
        };
    }
    return data[id];
}

module.exports = [

    // ================= COBRAR =================
    {
        data: new SlashCommandBuilder()
            .setName("cobrar")
            .setDescription("Cobrar sueldo según tu rol"),

        async execute(interaction) {

            const data = load(ECONOMIA_FILE);
            const sueldos = load(SUELDOS_FILE);
            const user = getUser(data, interaction.user.id);

            const ahora = Date.now();

            if (ahora - user.lastClaim < COOLDOWN) {
                const restante = COOLDOWN - (ahora - user.lastClaim);
                const dias = Math.ceil(restante / (1000 * 60 * 60 * 24));

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("⏳ No puedes cobrar aún")
                            .setDescription(`Debes esperar **${dias} días**.`)
                    ],
                    ephemeral: true
                });
            }

            let sueldoTotal = 0;

            interaction.member.roles.cache.forEach(role => {
                if (sueldos[role.id]) {
                    sueldoTotal += sueldos[role.id];
                }
            });

            if (sueldoTotal === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("❌ No tienes sueldo asignado")
                            .setDescription("Tu rol no tiene sueldo configurado.")
                    ],
                    ephemeral: true
                });
            }

            const impuesto = sueldoTotal * IMPUESTO;
            const final = sueldoTotal - impuesto;

            user.efectivo += final;
            user.lastClaim = ahora;

            save(ECONOMIA_FILE, data);

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("💰 Sueldo Cobrado")
                .addFields(
                    { name: "Sueldo bruto", value: `$${sueldoTotal}`, inline: true },
                    { name: "Impuestos (10%)", value: `$${impuesto}`, inline: true },
                    { name: "Recibido", value: `$${final}`, inline: true }
                )
                .setFooter({ text: "MIAMI RP" })
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        }
    },

    // ================= BALANCE =================
    {
        data: new SlashCommandBuilder()
            .setName("balance")
            .setDescription("Ver tu dinero"),

        async execute(interaction) {

            const data = load(ECONOMIA_FILE);
            const user = getUser(data, interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("💳 Tu Balance")
                .addFields(
                    { name: "💵 Efectivo", value: `$${user.efectivo}`, inline: true },
                    { name: "🏦 Banco", value: `$${user.banco}`, inline: true }
                )
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        }
    },

    // ================= DEPOSITAR =================
    {
        data: new SlashCommandBuilder()
            .setName("depositar")
            .setDescription("Depositar dinero al banco")
            .addIntegerOption(o =>
                o.setName("cantidad")
                 .setDescription("Cantidad")
                 .setRequired(true)
            ),

        async execute(interaction) {

            const cantidad = interaction.options.getInteger("cantidad");
            const data = load(ECONOMIA_FILE);
            const user = getUser(data, interaction.user.id);

            if (cantidad <= 0 || user.efectivo < cantidad)
                return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

            const impuestoBanco = cantidad * BANCO_IMPUESTO;
            const final = cantidad - impuestoBanco;

            user.efectivo -= cantidad;
            user.banco += final;

            save(ECONOMIA_FILE, data);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("🏦 Depósito realizado")
                        .setDescription(`Depositaste $${final}\nCosto bancario: $${impuestoBanco}`)
                ]
            });
        }
    },

    // ================= RETIRAR =================
    {
        data: new SlashCommandBuilder()
            .setName("retirar")
            .setDescription("Retirar dinero del banco")
            .addIntegerOption(o =>
                o.setName("cantidad")
                 .setDescription("Cantidad")
                 .setRequired(true)
            ),

        async execute(interaction) {

            const cantidad = interaction.options.getInteger("cantidad");
            const data = load(ECONOMIA_FILE);
            const user = getUser(data, interaction.user.id);

            if (cantidad <= 0 || user.banco < cantidad)
                return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

            user.banco -= cantidad;
            user.efectivo += cantidad;

            save(ECONOMIA_FILE, data);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("💵 Retiro realizado")
                        .setDescription(`Retiraste $${cantidad}`)
                ]
            });
        }
    },

    // ================= TOP DINERO =================
    {
        data: new SlashCommandBuilder()
            .setName("topdinero")
            .setDescription("Ver ranking económico"),

        async execute(interaction) {

            const data = load(ECONOMIA_FILE);

            const ranking = Object.entries(data)
                .map(([id, info]) => ({
                    id,
                    total: info.efectivo + info.banco
                }))
                .sort((a, b) => b.total - a.total);

            let descripcion = "";

            ranking.slice(0, 10).forEach((u, i) => {
                descripcion += `**#${i + 1}** <@${u.id}> - $${u.total}\n`;
            });

            const posicion = ranking.findIndex(u => u.id === interaction.user.id) + 1;

            const embed = new EmbedBuilder()
                .setColor("Gold")
                .setTitle("🏆 Ranking de Dinero")
                .setDescription(descripcion || "Sin datos.")
                .setFooter({ text: `Tu posición: #${posicion || "Sin puesto"}` })
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        }
    },

    // ================= AÑADIR SUELDO =================
    {
        data: new SlashCommandBuilder()
            .setName("añadir-sueldo")
            .setDescription("Asignar sueldo a un rol")
            .addRoleOption(o =>
                o.setName("rol")
                 .setDescription("Rol")
                 .setRequired(true)
            )
            .addIntegerOption(o =>
                o.setName("cantidad")
                 .setDescription("Cantidad")
                 .setRequired(true)
            ),

        async execute(interaction) {

            if (!interaction.member.roles.cache.has(STAFF_ROLE))
                return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });

            const role = interaction.options.getRole("rol");
            const cantidad = interaction.options.getInteger("cantidad");

            const sueldos = load(SUELDOS_FILE);

            sueldos[role.id] = cantidad;
            save(SUELDOS_FILE, sueldos);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Purple")
                        .setTitle("💼 Sueldo Configurado")
                        .setDescription(`${role} cobrará **$${cantidad}** cada 6 días.`)
                        .setTimestamp()
                ]
            });
        }
    }

];
