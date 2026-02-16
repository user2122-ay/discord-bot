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
    return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("economia")
        .setDescription("Sistema financiero del servidor")
        .addSubcommand(sub =>
            sub.setName("balance")
            .setDescription("Ver tu dinero"))
        .addSubcommand(sub =>
            sub.setName("cobrar")
            .setDescription("Cobrar tu sueldo"))
        .addSubcommand(sub =>
            sub.setName("transferir")
            .setDescription("Transferir dinero a otro usuario")
            .addUserOption(o =>
                o.setName("usuario")
                .setDescription("Usuario a transferir")
                .setRequired(true))
            .addIntegerOption(o =>
                o.setName("cantidad")
                .setDescription("Cantidad a transferir")
                .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("añadir-dinero")
            .setDescription("Añadir dinero a un usuario")
            .addUserOption(o =>
                o.setName("usuario")
                .setDescription("Usuario")
                .setRequired(true))
            .addIntegerOption(o =>
                o.setName("cantidad")
                .setDescription("Cantidad")
                .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("restar-dinero")
            .setDescription("Restar dinero a un usuario")
            .addUserOption(o =>
                o.setName("usuario")
                .setDescription("Usuario")
                .setRequired(true))
            .addIntegerOption(o =>
                o.setName("cantidad")
                .setDescription("Cantidad")
                .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("depositar")
            .setDescription("Depositar dinero al banco")
            .addIntegerOption(o =>
                o.setName("cantidad")
                .setDescription("Cantidad")
                .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("retirar")
            .setDescription("Retirar dinero del banco")
            .addIntegerOption(o =>
                o.setName("cantidad")
                .setDescription("Cantidad")
                .setRequired(true))),

    async execute(interaction) {

        const data = loadData();
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (!data.users[userId]) {
            data.users[userId] = {
                efectivo: 0,
                banco: 0,
                lastClaim: 0
            };
        }

        const user = data.users[userId];

        /* ================= BALANCE ================= */

        if (sub === "balance") {

            const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setAuthor({ 
                    name: `Cuenta bancaria de ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTitle("🏦┃ESTADO FINANCIERO")
                .setDescription("━━━━━━━━━━━━━━━━━━")
                .addFields(
                    { name: "💵 Efectivo", value: `\`\`\`$${user.efectivo}\`\`\``, inline: true },
                    { name: "🏦 Banco", value: `\`\`\`$${user.banco}\`\`\``, inline: true },
                    { name: "📊 Patrimonio Total", value: `\`\`\`$${user.efectivo + user.banco}\`\`\`` }
                )
                .setFooter({ text: "Sistema Financiero Oficial" })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        /* ================= COBRAR ================= */

        if (sub === "cobrar") {

            const now = Date.now();
            const cooldown = 6 * 24 * 60 * 60 * 1000;

            if (now - user.lastClaim < cooldown) {
                const restante = Math.ceil((cooldown - (now - user.lastClaim)) / (1000 * 60 * 60 * 24));
                return interaction.reply({ content: `⏳ Debes esperar ${restante} día(s) más.`, ephemeral: true });
            }

            let sueldoTotal = 0;

            interaction.member.roles.cache.forEach(role => {
                if (data.roles[role.id]) {
                    sueldoTotal += data.roles[role.id];
                }
            });

            if (sueldoTotal <= 0)
                return interaction.reply({ content: "❌ No tienes un rol con sueldo asignado.", ephemeral: true });

            const impuesto = Math.floor(sueldoTotal * 0.10);
            const final = sueldoTotal - impuesto;

            user.efectivo += final;
            user.lastClaim = now;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor("#00ff88")
                .setAuthor({ 
                    name: `${interaction.user.username} ha cobrado su sueldo`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTitle("💼┃NÓMINA PROCESADA")
                .setDescription("━━━━━━━━━━━━━━━━━━")
                .addFields(
                    { name: "💰 Sueldo bruto", value: `\`\`\`$${sueldoTotal}\`\`\``, inline: true },
                    { name: "🏛️ Impuestos (10%)", value: `\`\`\`-$${impuesto}\`\`\``, inline: true },
                    { name: "💵 Total recibido", value: `\`\`\`$${final}\`\`\``, inline: true }
                )
                .setFooter({ text: "Próximo cobro en 6 días" })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        /* ================= TRANSFERIR ================= */

        if (sub === "transferir") {

            const target = interaction.options.getUser("usuario");
            const cantidad = interaction.options.getInteger("cantidad");

            if (cantidad <= 0)
                return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

            if (user.efectivo < cantidad)
                return interaction.reply({ content: "❌ No tienes suficiente dinero.", ephemeral: true });

            if (!data.users[target.id]) {
                data.users[target.id] = { efectivo: 0, banco: 0, lastClaim: 0 };
            }

            user.efectivo -= cantidad;
            data.users[target.id].efectivo += cantidad;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor("#00ffcc")
                .setTitle("💸┃TRANSFERENCIA EXITOSA")
                .setDescription("━━━━━━━━━━━━━━━━━━")
                .addFields(
                    { name: "👤 Remitente", value: `${interaction.user}`, inline: true },
                    { name: "📥 Destinatario", value: `${target}`, inline: true },
                    { name: "💰 Cantidad", value: `\`\`\`$${cantidad}\`\`\`` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        /* ================= AÑADIR / RESTAR ================= */

        if (sub === "añadir-dinero" || sub === "restar-dinero") {

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
                return interaction.reply({ content: "❌ Solo administradores.", ephemeral: true });

            const target = interaction.options.getUser("usuario");
            const cantidad = interaction.options.getInteger("cantidad");

            if (!data.users[target.id]) {
                data.users[target.id] = { efectivo: 0, banco: 0, lastClaim: 0 };
            }

            if (sub === "añadir-dinero") {
                data.users[target.id].efectivo += cantidad;
            } else {
                data.users[target.id].efectivo -= cantidad;
            }

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(sub === "añadir-dinero" ? "#3498db" : "#ff4444")
                .setTitle(sub === "añadir-dinero" ? "💼┃AJUSTE FINANCIERO" : "🚨┃SANCIÓN ECONÓMICA")
                .addFields(
                    { name: "👤 Usuario", value: `${target}`, inline: true },
                    { name: "💰 Cantidad", value: `\`\`\`$${cantidad}\`\`\`` }
                )
                .setFooter({ text: `Acción realizada por ${interaction.user.tag}` })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        /* ================= BANCO ================= */

        if (sub === "depositar") {

            const cantidad = interaction.options.getInteger("cantidad");

            if (user.efectivo < cantidad)
                return interaction.reply({ content: "❌ No tienes suficiente efectivo.", ephemeral: true });

            const impuestoBanco = Math.floor(cantidad * 0.05);
            const final = cantidad - impuestoBanco;

            user.efectivo -= cantidad;
            user.banco += final;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor("#2ecc71")
                .setTitle("🏦┃DEPÓSITO CONFIRMADO")
                .addFields(
                    { name: "💰 Depositado", value: `\`\`\`$${final}\`\`\`` },
                    { name: "🏛️ Comisión (5%)", value: `\`\`\`-$${impuestoBanco}\`\`\`` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === "retirar") {

            const cantidad = interaction.options.getInteger("cantidad");

            if (user.banco < cantidad)
                return interaction.reply({ content: "❌ No tienes suficiente dinero en banco.", ephemeral: true });

            user.banco -= cantidad;
            user.efectivo += cantidad;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor("#27ae60")
                .setTitle("💵┃RETIRO COMPLETADO")
                .addFields(
                    { name: "💰 Cantidad retirada", value: `\`\`\`$${cantidad}\`\`\`` }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

    }
};
