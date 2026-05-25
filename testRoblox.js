const axios = require("axios");

async function test() {
  try {

    const username = "itsanthony_21";

    // Buscar ID por nombre
    const buscar = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false
      }
    );

    const usuario = buscar.data.data[0];

    if (!usuario) {
      return console.log("❌ Usuario no encontrado");
    }

    console.log("✅ Usuario encontrado");
    console.log("ID:", usuario.id);
    console.log("Nombre:", usuario.name);
    console.log("Display:", usuario.displayName);

    // Obtener perfil
    const perfil = await axios.get(
      `https://users.roblox.com/v1/users/${usuario.id}`
    );

    console.log("\n📄 Perfil:");
    console.log(perfil.data);

  } catch (error) {
    console.error("❌ Error:");
    console.error(error.response?.data || error.message);
  }
}

test();
