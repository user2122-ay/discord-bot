module.exports = (client) => {

    const estados = [
        { name: "🌴 Roleando en Los Santos RP", type: 0 },
        { name: "🚓 Patrullando la ciudad", type: 3 },
        { name: "🎧 Radio policial activa", type: 2 },
        { name: "💰 Sistema económico", type: 0 },
        { name: "🚨 Alertas activas", type: 3 },
        { name: "👮‍♂️ Controlando el crimen", type: 0 },
        { name: "📋 Sistema de DNIs", type: 0 },
        { name: "🚗 Multando conductores", type: 0 },
        { name: "🌆 Vida en Los Santos", type: 3 },
        { name: "🧠 IA del servidor", type: 2 },
        { name: "🔒 Anti-Raid activo", type: 3 },
        { name: "⚖️ Justicia RP", type: 0 }
    ];

    let i = 0;

    client.on("ready", () => {
        console.log("🎮 Sistema de estados activo");

        const cambiarEstado = () => {
            const estado = estados[i];

            client.user.setActivity(estado.name, { type: estado.type });

            i++;
            if (i >= estados.length) i = 0;
        };

        // 🔁 Cambiar cada 10 minutos
        setInterval(cambiarEstado, 5000);

        // 🔥 Ejecutar uno al iniciar
        cambiarEstado();
    });

};
