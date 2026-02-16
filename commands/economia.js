const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const DATA_FILE = './economia.json';
const SUELDO = 1000;
const IMPUESTO = 0.10; // 10%
const BANCO_IMPUESTO = 0.02; // 2% por guardar dinero
const STAFF_ROLE = "1472766576934649979";

function loadData() {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getUser(data, userId) {
    if (!data[userId]) {
        data[userId] = {
            efectivo: 0,
            banco: 0
        };
    }
    return data[userId];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('economia')
        .setDescription('Sistema económico')
        .addSubcommand(s => s.setName('cobrar').setDescription('Cobrar sueldo'))
        .addSubcommand(s => s.setName('balance').setDescription('Ver balance'))
        .addSubcommand(s =>
            s.setName('depositar')
            .setDescription('Depositar dinero')
            .addIntegerOption(o =>
                o.setName('cantidad')
                .setDescription('Cantidad a depositar')
                .setRequired(true)))
        .addSubcommand(s =>
            s.setName('retirar')
            .setDescription('Retirar dinero')
            .addIntegerOption(o =>
                o.setName('cantidad')
                .setDescription('Cantidad a retirar')
                .setRequired(true)))
        .addSubcommand(s => s.setName('topdinero').setDescription('Ranking de dinero'))
        .addSubcommand(s =>
            s.setName('añadir-economia')
            .setDescription('Añadir dinero a un usuario')
            .addUserOption(o =>
                o.setName('usuario')
                .setDescription('Usuario')
                .setRequired(true))
            .addIntegerOption(o =>
                o.setName('cantidad')
                .setDescription('Cantidad')
                .setRequired(true))
        ),

    async execute(interaction) {

        const data = loadData();
        const sub = interaction.options.getSubcommand();
        const userData = getUser(data, interaction.user.id);

        // COBRAR
        if (sub === 'cobrar') {

            const impuesto = SUELDO * IMPUESTO;
            const total = SUELDO - impuesto;

            userData.efectivo += total;
            saveData(data);

            return interaction.reply(`💰 Has cobrado $${total} (Impuestos: $${impuesto})`);
        }

        // BALANCE
        if (sub === 'balance') {

            return interaction.reply(
                `💵 Efectivo: $${userData.efectivo}\n🏦 Banco: $${userData.banco}`
            );
        }

        // DEPOSITAR
        if (sub === 'depositar') {

            const cantidad = interaction.options.getInteger('cantidad');

            if (cantidad <= 0) return interaction.reply("Cantidad inválida.");
            if (userData.efectivo < cantidad) return interaction.reply("No tienes suficiente efectivo.");

            const impuestoBanco = cantidad * BANCO_IMPUESTO;
            const total = cantidad - impuestoBanco;

            userData.efectivo -= cantidad;
            userData.banco += total;

            saveData(data);

            return interaction.reply(`🏦 Depositaste $${total} (Costo bancario: $${impuestoBanco})`);
        }

        // RETIRAR
        if (sub === 'retirar') {

            const cantidad = interaction.options.getInteger('cantidad');

            if (cantidad <= 0) return interaction.reply("Cantidad inválida.");
            if (userData.banco < cantidad) return interaction.reply("No tienes suficiente dinero en el banco.");

            userData.banco -= cantidad;
            userData.efectivo += cantidad;

            saveData(data);

            return interaction.reply(`💵 Retiraste $${cantidad}`);
        }

        // TOPDINERO
        if (sub === 'topdinero') {

            const ranking = Object.entries(data)
                .map(([id, info]) => ({
                    id,
                    total: info.efectivo + info.banco
                }))
                .sort((a, b) => b.total - a.total);

            let mensaje = "🏆 **Ranking de Dinero**\n";

            ranking.slice(0, 10).forEach((u, i) => {
                mensaje += `#${i + 1} <@${u.id}> - $${u.total}\n`;
            });

            const posicion = ranking.findIndex(u => u.id === interaction.user.id) + 1;

            mensaje += `\n📍 Tu posición: #${posicion}`;

            return interaction.reply(mensaje);
        }

        // AÑADIR ECONOMIA (solo rol específico)
        if (sub === 'añadir-economia') {

            if (!interaction.member.roles.cache.has(STAFF_ROLE)) {
                return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
            }

            const target = interaction.options.getUser('usuario');
            const cantidad = interaction.options.getInteger('cantidad');

            const targetData = getUser(data, target.id);
            targetData.efectivo += cantidad;

            saveData(data);

            return interaction.reply(`💰 Se añadieron $${cantidad} a ${target.username}`);
        }
    }
};
