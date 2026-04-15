module.exports = (client) => {

    client.on("messageCreate", async (message) => {

        // ❌ Ignorar bots
        if (message.author.bot) return;

        // 🔥 SOLO MENSAJES PRIVADOS (MD)
        if (message.guild) return;

        console.log("📩 MD recibido:", message.content);

        try {

            await message.reply(
`👋 Hola, soy el sistema de soporte automático.

📌 Opciones disponibles:

1️⃣ Tickets  
2️⃣ Normativa  
3️⃣ Conceptos RP  
4️⃣ Estado del servidor  
5️⃣ Hablar con staff  

Responde con el número de la opción.`
            );

        } catch (err) {
            console.log("❌ Error respondiendo MD:", err);
        }

    });

};
