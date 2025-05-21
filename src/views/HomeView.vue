<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-50 text-gray-800 font-inter">
    <header class="w-full bg-blue-700 bg-opacity-90 shadow-lg p-4 flex justify-between items-center fixed top-0 z-10">
      <div class="text-3xl font-extrabold text-white tracking-wide">IngeniaCore</div>
      <nav>
        <router-link
          to="/login"
          class="px-6 py-2 rounded-lg bg-white text-blue-700 font-semibold transition-colors duration-300 shadow-md hover:bg-gray-100"
        >
          Iniciar sesión
        </router-link>
      </nav>
    </header>

    <section class="flex-grow flex items-center justify-center text-center p-8 mt-16">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up text-blue-800">
          Bienvenido a tu Centro de Soporte IngeniaCore
        </h1>
        <p class="text-xl text-gray-700 mb-10 animate-fade-in-up delay-200">
          Tu solución integral para gestionar solicitudes y optimizar la atención al cliente.
          Accede con tus credenciales proporcionadas para empezar.
        </p>
        <div class="animate-fade-in-up delay-400">
          <router-link to="/login">
            <button
             style="background-color:aquamarine !important; color:black !important"
            class="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Acceder al Sistema
            </button>
          </router-link>
        </div>
      </div>
    </section>

    <footer class="w-full bg-blue-700 bg-opacity-90 text-gray-200 text-center p-4">
      <p>&copy; 2025 IngeniaCore. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// No se necesita lógica de script para esta vista simple
</script>

<style scoped>
/* Importa la fuente Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

/* Animaciones */
@keyframes fadeInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



.delay-200 {
  animation-delay: 0.2s;
}

.delay-400 {
  animation-delay: 0.4s;
}
</style>
