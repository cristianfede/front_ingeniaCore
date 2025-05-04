<template>
  <div class="home-container">
    <!-- Barra de navegación -->
    <header class="navbar">
      <div class="logo">IngeniaCore</div>
      <nav>
        <router-link to="/login">Iniciar sesión</router-link>
        <router-link to="/register">Registrarse</router-link>
      </nav>
    </header>

    <!-- Sección principal -->
    <section class="main-section">
      <div class="main-content">
        <h1>Gestiona tus proyectos de forma más eficiente</h1>
        <p>Optimiza tus tareas y colabora en tiempo real con nuestro software.</p>
        <div class="cta-buttons">
          <router-link to="/login">
            <button class="btn">Iniciar sesión</button>
          </router-link>
          <router-link to="/register">
            <button class="btn primary">Crear cuenta</button>
          </router-link>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>© 2025 Mi Aplicación. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
body {
  font-family: 'roboto';
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0078d4;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
}

.home-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.navbar {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background-color: #2d2d2d;
  color: white;
  width: 100%;
  position: absolute;
  top: 0;
  padding: 0;
  margin: 0;
}

.navbar .logo {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.navbar nav a {
  color: white;
  text-decoration: none;
  margin-left: 20px;
  font-size: 16px;
}

/* Sección principal */
.main-section {
  display: flex;
  justify-content: center;
  align-items: center; /* Centra el contenido verticalmente */
  background: no-repeat center center;
  background-size: cover;
  width: 100%;
  min-height: 70vh;
  color: black;
  text-align: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.main-content {
  max-width: 1000px; /* Asegura que el contenido no exceda este ancho */
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.main-content h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.main-content p {
  font-size: 18px;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  justify-content: center; /* Centra los botones */
  gap: 20px; /* Espacio entre los botones */
}

.cta-buttons .btn {
  padding: 15px 30px;
  margin: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.cta-buttons .btn.primary {
  background-color: #0078d4;
  color: white;
}

.cta-buttons .btn:hover {
  opacity: 0.8;
}

/* Pie de página */
.footer {
  background-color: #f1f1f1;
  text-align: center;
  padding: 10px;
  width: 100%;
  position: absolute;
  bottom: 0;
  box-sizing: border-box;
}
</style>
