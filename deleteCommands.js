const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" })
.setToken(process.env.TOKEN);

(async () => {

try {

console.log("🗑️ Eliminando TODOS los comandos...");

await rest.put(
Routes.applicationGuildCommands(
process.env.CLIENT_ID,
process.env.GUILD_ID
),
{ body: [] }
);

console.log("✅ Todos los comandos fueron eliminados.");

} catch (error) {

console.error("❌ Error:", error);

}

})();
