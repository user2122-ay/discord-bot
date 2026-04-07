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

// 🔧 ASEGURAR USUARIO
async function ensureUser(pool, userId) {
  await pool.query(`
    INSERT INTO economia_ls_v2 (discord_id)
    VALUES ($1)
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
    const pool = interaction.client.pool;
    const userId = interaction.user.id;

    await ensureUser(pool, userId);

    const res = await pool.query(
      "SELECT * FROM economia_ls_v2 WHERE discord_id = $1",
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
    const pool = interaction.client.pool;

    if (!interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id))) {
      return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const rol = interaction.options.getRole("rol");
    const cantidad = interaction.options.getInteger("cantidad");

    await pool.query(`
      INSERT INTO sueldos_ls (role_id, sueldo)
      VALUES ($1, $2)
      ON CONFLICT (role_id)
      DO UPDATE SET sueldo = EXCLUDED.sueldo
    `, [rol.id, cantidad]);

    return interaction.reply(`💼 Sueldo asignado: $${cantidad}`);
  }
};

/* ================= COBRAR ================= */
module.exports.cobrar = {
  permisos: "🌐 Todos",
  data: new SlashCommandBuilder()
    .setName("cobrar")
    .setDescription("Cobrar tu sueldo"),

  async execute(interaction) {
    const pool = interaction.client.pool;
    const userId = interaction.user.id;

    await ensureUser(pool, userId);

    let user = await pool.query(
      "SELECT * FROM economia_ls_v2 WHERE discord_id = $1",
      [userId]
    );

    user = user.rows[0];

    const cooldown = 6 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - user.last_pay < cooldown)
      return interaction.reply({ content: "⏳ Aún no puedes cobrar.", ephemeral: true });

    let sueldoTotal = 0;
    const sueldos = await pool.query("SELECT * FROM sueldos_ls");

    interaction.member.roles.cache.forEach(r => {
      const s = sueldos.rows.find(x => x.role_id === r.id);
      if (s) sueldoTotal += s.sueldo;
    });

    if (sueldoTotal <= 0)
      return interaction.reply({ content: "❌ No tienes sueldo.", ephemeral: true });

    const impuesto = Math.floor(sueldoTotal * 0.10);
    const final = sueldoTotal - impuesto;

    await pool.query(`
      UPDATE economia_ls_v2
      SET cash = cash + $1, last_pay = $2
      WHERE discord_id = $3
    `, [final, now, userId]);

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
    const pool = interaction.client.pool;

    const sender = interaction.user.id;
    const target = interaction.options.getUser("usuario").id;
    const cantidad = interaction.options.getInteger("cantidad");

    if (cantidad <= 0)
      return interaction.reply({ content: "❌ Cantidad inválida.", ephemeral: true });

    await ensureUser(pool, sender);
    await ensureUser(pool, target);

    const res = await pool.query(
      "SELECT cash FROM economia_ls_v2 WHERE discord_id = $1",
      [sender]
    );

    if (res.rows[0].cash < cantidad)
      return interaction.reply({ content: "❌ No tienes dinero.", ephemeral: true });

    await pool.query(`UPDATE economia_ls_v2 SET cash = cash - $1 WHERE discord_id = $2`, [cantidad, sender]);
    await pool.query(`UPDATE economia_ls_v2 SET cash = cash + $1 WHERE discord_id = $2`, [cantidad, target]);

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
    const pool = interaction.client.pool;
    const userId = interaction.user.id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(pool, userId);

    await pool.query(`
      UPDATE economia_ls_v2
      SET cash = cash - $1, bank = bank + $1
      WHERE discord_id = $2
    `, [cantidad, userId]);

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
    const pool = interaction.client.pool;
    const userId = interaction.user.id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(pool, userId);

    await pool.query(`
      UPDATE economia_ls_v2
      SET bank = bank - $1, cash = cash + $1
      WHERE discord_id = $2
    `, [cantidad, userId]);

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
    const pool = interaction.client.pool;

    if (!interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id))) {
      return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const target = interaction.options.getUser("usuario").id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(pool, target);

    await pool.query(`
      UPDATE economia_ls_v2
      SET cash = cash + $1
      WHERE discord_id = $2
    `, [cantidad, target]);

    return interaction.reply(`💰 Añadidos $${cantidad}`);
  }
};

/* ================= QUITAR DINERO ================= */
module.exports["quitar-dinero"] = {
  permisos: "👑 Fundación",
  data: new SlashCommandBuilder()
    .setName("quitar-dinero")
    .setDescription("Quitar dinero")
    .addUserOption(o => o.setName("usuario").setRequired(true))
    .addIntegerOption(o => o.setName("cantidad").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const pool = interaction.client.pool;

    if (!interaction.member.roles.cache.some(r => ROLES_FUNDACION.includes(r.id))) {
      return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
    }

    const target = interaction.options.getUser("usuario").id;
    const cantidad = interaction.options.getInteger("cantidad");

    await ensureUser(pool, target);

    await pool.query(`
      UPDATE economia_ls_v2
      SET cash = GREATEST(cash - $1, 0)
      WHERE discord_id = $2
    `, [cantidad, target]);

    return interaction.reply(`💸 Quitados $${cantidad}`);
  }
};

/* ================= TOP DINERO ================= */
module.exports["top-dinero"] = {
  permisos: "🌐 Todos",
  data: new SlashCommandBuilder()
    .setName("top-dinero")
    .setDescription("Ranking"),

  async execute(interaction) {
    const pool = interaction.client.pool;

    const res = await pool.query(`
      SELECT discord_id, (cash + bank) AS total
      FROM economia_ls_v2
      ORDER BY total DESC
      LIMIT 10
    `);

    let desc = "";

    for (let i = 0; i < res.rows.length; i++) {
      const user = res.rows[i];
      desc += `**${i + 1}.** <@${user.discord_id}> - $${user.total}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Ranking")
      .setDescription(desc);

    interaction.reply({ embeds: [embed] });
  }
};
