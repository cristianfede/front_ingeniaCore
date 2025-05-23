<template>
  <v-container class="py-5">
    <v-card class="profile-card" outlined>
      <v-card-title class="text-h5 text-center py-4 profile-title">
        Perfil de Usuario
      </v-card-title>
      <v-card-text>
        <p class="text-lg text-center mb-10 profile-subtitle">
          Aquí puedes ver toda la información de tu perfil y los detalles asociados.
        </p>

        <div v-if="authStore.user" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="profile-picture-section">
            <h3 class="text-2xl font-semibold mb-4 section-title-blue">Foto de Perfil</h3>
            <div class="avatar-container">
              <img
                :src="'https://i.pravatar.cc/160?img=3'" alt="Foto de Perfil"
                class="profile-avatar"
                @error="handleImageError"
              />
              <label for="profile-picture-upload" class="upload-overlay">
                <v-icon>mdi-camera</v-icon>
              </label>
              <input
                type="file"
                id="profile-picture-upload"
                ref="profilePictureInput"
                @change="handleFileChange"
                class="hidden-input"
                accept="image/*"
              />
            </div>
            <v-btn
              v-if="selectedFile"
              @click="uploadProfilePicture"
              color="green"
              class="upload-button"
              :loading="uploading"
            >
              <v-icon left>mdi-upload</v-icon> Subir Foto
            </v-btn>
            <p v-if="uploading" class="uploading-text">Subiendo...</p>
          </div>

          <div class="info-section">
            <h3 class="text-2xl font-semibold mb-4 section-title-blue">Datos Personales</h3>
            <div class="space-y-3">
              <p><span class="font-medium info-label">Nombre Completo:</span> Juan Pérez</p>
              <p><span class="font-medium info-label">Email:</span> juan.perez@example.com</p>
              <p><span class="font-medium info-label">Teléfono:</span> +57 300 123 4567</p>
              <p><span class="font-medium info-label">Creado el:</span> 15 de Enero de 2023</p>
              <p><span class="font-medium info-label">Última Actualización:</span> 20 de Mayo de 2024</p>
            </div>
          </div>

          <div class="info-section">
            <h3 class="text-2xl font-semibold mb-4 section-title-green">Roles Asignados</h3>
            <div v-if="authStore.user.roles && authStore.user.roles.length > 0">
              <ul class="list-disc list-inside space-y-2">
                <li v-for="role in authStore.user.roles" :key="role.id" class="info-text">
                  {{ role.nombre }}
                </li>
              </ul>
            </div>
            <p v-else class="info-text-secondary">No hay roles asignados.</p>
          </div>

          <div v-if="authStore.user.tipoUsuario === 'externo' && authStore.user.empresa" class="info-section col-span-1 md:col-span-2">
            <h3 class="text-2xl font-semibold mb-4 section-title-purple">Información de la Empresa</h3>
            <div class="space-y-3">
              <p><span class="font-medium info-label">Nombre de la Empresa:</span> {{ authStore.user.empresa.nombre || 'N/A' }}</p>
              <p><span class="font-medium info-label">NIT:</span> {{ authStore.user.empresa.nit || 'N/A' }}</p>
              <p><span class="font-medium info-label">Correo de Contacto:</span> {{ authStore.user.empresa.correo || 'N/A' }}</p>
            </div>
          </div>
          <div v-else-if="authStore.user.tipoUsuario === 'externo'" class="info-section col-span-1 md:col-span-2">
            <p class="info-text-secondary">No hay información de empresa disponible.</p>
          </div>

          <div class="info-section col-span-1 md:col-span-2">
            <h3 class="text-2xl font-semibold mb-4 section-title-yellow">Empresa Asociada</h3>
            <p class="info-text">IngeniaCore</p> </div>

          <div class="col-span-1 md:col-span-2 text-center mt-6">
            <v-btn @click="editProfile" color="blue" class="edit-button">
              <v-icon left>mdi-pencil</v-icon> Editar Perfil
            </v-btn>
          </div>
        </div>
        <div v-else class="text-center mt-12 p-8 loading-section">
          <p class="text-xl font-semibold loading-text">Cargando información del usuario...</p>
        </div>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authSetStore } from '@/stores/AuthStore';
import { useRouter } from 'vue-router';
// Importa tu servicio de usuario para la carga de imágenes, o crea uno si no existe.
// Ejemplo: import { uploadProfileImage } from '@/services/userService';

const authStore = authSetStore();
const router = useRouter();

// Estado para la carga de fotos de perfil
const profilePictureInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const profilePicturePreview = ref<string | null>(null);
const uploading = ref(false);

// Estado para el Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
});

onMounted(async () => {
  // Asegúrate de que el usuario esté cargado en el store al montar el componente
  await authStore.checkAuth();
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicturePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile.value);
  } else {
    selectedFile.value = null;
    profilePicturePreview.value = null;
  }
};

const uploadProfilePicture = async () => {
  if (!selectedFile.value || !authStore.user?.id) {
    snackbar.value = { show: true, message: 'Por favor, selecciona una imagen primero.', color: 'warning' };
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('profile_picture', selectedFile.value);
    
    // --- Llama a tu servicio para subir la imagen ---
    // Necesitarás implementar esta función en un archivo de servicio (ej. userService.ts)
    // que haga una petición POST/PUT a tu backend con el FormData.
    // El backend debería devolver la nueva URL de la imagen.
    // Ejemplo de cómo podría ser:
    // const response = await uploadProfileImage(authStore.user.id, formData);
    
    // --- Mock de respuesta para desarrollo (eliminar en producción) ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula una carga
    const mockResponse = { profilePictureUrl: 'https://i.pravatar.cc/160?img=' + Math.floor(Math.random() * 70) };
    // --- Fin Mock ---

    // if (response && response.profilePictureUrl) { // Usar esto con tu servicio real
    if (mockResponse && mockResponse.profilePictureUrl) { // Usar esto con el mock
      // Actualiza la URL de la foto de perfil en el store del usuario
      // Asegúrate de que tu AuthStore.ts tenga una forma de actualizar el user.profilePictureUrl
      if (authStore.user) {
        authStore.user.profilePictureUrl = mockResponse.profilePictureUrl;
        // Opcional: Actualizar localStorage si el store no lo hace automáticamente
        // localStorage.setItem('user', JSON.stringify(authStore.user));
      }
      snackbar.value = { show: true, message: 'Foto de perfil actualizada exitosamente.', color: 'success' };
      selectedFile.value = null; // Limpiar el archivo seleccionado
      profilePicturePreview.value = null; // Limpiar la previsualización
    } else {
      throw new Error('La respuesta de la subida no contiene la URL de la imagen.');
    }
  } catch (error: any) {
    console.error('Error al subir la foto de perfil:', error);
    snackbar.value = { show: true, message: error.message || 'Error al subir la foto de perfil.', color: 'error' };
  } finally {
    uploading.value = false;
  }
};

const handleImageError = (event: Event) => {
  // En caso de que la URL de la imagen no cargue, muestra una imagen de placeholder
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'https://placehold.co/160x160/FF5252/ffffff?text=Error';
};

const editProfile = () => {
  router.push('/settings'); // Redirige a la ruta /settings
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Estilos para el contenedor principal de la tarjeta */
.profile-card {
  max-width: 1000px; /* Tamaño más grande */
  margin: 20px auto; /* Centrado horizontal */
  background-color: #ffffff; /* Fondo blanco */
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
}

.profile-title {
  color: #333333; /* Color de título oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

.profile-subtitle {
  color: #555555; /* Color de subtítulo gris */
  font-family: 'Inter', sans-serif;
}

/* Estilos para las secciones de información individuales */
.info-section {
  background-color: #f9f9f9; /* Fondo muy claro para las secciones */
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Sombra sutil */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinea el contenido a la izquierda */
}

/* Estilos para la sección de foto de perfil */
.profile-picture-section {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido de esta sección */
  justify-content: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #42A5F5; /* Borde azul */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay .v-icon {
  color: white;
  font-size: 48px;
}

.hidden-input {
  display: none;
}

.upload-button {
  margin-top: 10px;
  text-transform: none; /* Evita que el texto del botón esté en mayúsculas */
  font-weight: 600;
}

.uploading-text {
  color: #1976D2;
  margin-top: 10px;
  font-size: 0.9rem;
}


/* Títulos de sección */
.section-title-blue {
  color: #1976D2; /* Azul de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center; /* Centrado para todos los títulos de sección */
  width: 100%; /* Asegura que ocupe todo el ancho para el centrado */
}

.section-title-green {
  color: #4CAF50; /* Verde de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.section-title-purple {
  color: #9C27B0; /* Morado de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.section-title-yellow {
  color: #FFC107; /* Amarillo de Vuetify para títulos de sección */
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  width: 100%;
}

.info-label {
  color: #333333; /* Etiquetas en color oscuro */
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.info-text {
  color: #555555; /* Texto de información en gris oscuro */
  font-family: 'Inter', sans-serif;
}

.info-text-secondary {
  color: #777777; /* Texto secundario en gris más claro */
  font-family: 'Inter', sans-serif;
}

/* Estilos para el botón de edición */
.edit-button {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.edit-button:hover {
  background-color: #1565C0 !important; /* Un azul un poco más oscuro al pasar el ratón */
}

/* Estilos para el mensaje de carga */
.loading-section {
  background-color: #f0f0f0; /* Fondo claro para el mensaje de carga */
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-text {
  color: #333333; /* Texto de carga oscuro */
  font-family: 'Inter', sans-serif;
}

/* Estilos de cuadrícula (manteniendo la utilidad de Tailwind para el layout) */
.grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .col-span-1 { grid-column: span 1 / span 1; }
  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

/* Clases de utilidad de espaciado y texto (pueden ser de Tailwind o custom) */
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-12 { margin-top: 3rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.p-8 { padding: 2rem; }
.text-center { text-align: center; }
.text-h5 { font-size: 1.5rem; line-height: 2rem; } /* Vuetify h5 equivalent */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.space-y-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
}
.capitalize { text-transform: capitalize; }
.list-disc { list-style-type: disc; }
.list-inside { list-style-position: inside; }

/* Icono de Font Awesome (si lo usas directamente, aunque Vuetify usa mdi) */
.fa-edit {
  margin-right: 0.5rem;
}
</style>
