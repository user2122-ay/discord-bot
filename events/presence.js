module.exports = (client) => {

    const estados = [
        { name: "🇵🇦  Roleando en Panamá RP V2", type: 0 },
        { name: "🚓 Patrullando la ciudad", type: 3 },
        { name: "🎧 Radio policial activa", type: 2 },
        { name: "💰 Sistema económico", type: 0 },
        { name: "🚨 Alertas activas", type: 3 },
        { name: "👮 Controlando el crimen", type: 0 },
        { name: "📋 Sistema de Cédulas", type: 0 },
        { name: "🚗 Multando conductores", type: 0 },
        { name: "🌆 Vida en Panamá", type: 3 },
        { name: "🧠 IA del servidor", type: 2 },
        { name: "🔒 Anti-Raid activo", type: 3 },
        { name: "⚖️ Justicia RP", type: 0 }
    ];

    let i = 0;

    client.once("ready", () => {
        console.log("✅ Sistema de presence cargado");

        const cambiarEstado = () => {
            const estado = estados[i];

            client.user.setPresence({
                activities: [{
                    name: estado.name,
                    type: estado.type
                }],
                status: "online"
            });

            i++;
            if (i >= estados.length) i = 0;
        };

        // 🔥 Ejecutar al iniciar
        cambiarEstado();

        // 🔁 Cada 10 minutos
        setInterval(cambiarEstado, 25 * 1000);
    });

};
