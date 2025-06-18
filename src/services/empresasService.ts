// src/services/empresasService.ts

const API_BASE_URL = 'http://localhost:3333/api' // Asegúrate de que esta URL sea correcta

interface EmpresaData {
  nombre: string
  nit: string
  correo: string
  telefono: string
  estado?: 'activo' | 'inactivo' // Añadir 'estado' como opcional para creación/actualización
}

// 1. Función para obtener empresas (ahora con filtro de estado opcional)
export async function obtenerEmpresas(estadoFiltro?: string) {
  try {
    let url = `${API_BASE_URL}/empresas`;
    // Si se proporciona un filtro de estado y no es 'todos', añadirlo a la URL
    if (estadoFiltro && estadoFiltro !== 'todos') {
      url += `?estado=${estadoFiltro}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al obtener empresas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
}

// 2. Función para crear empresa (asegúrate de que el backend le asigne 'activo' por defecto)
export async function crearEmpresa(empresaData: EmpresaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al crear empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al crear empresa:', error);
    throw error;
  }
}

// 3. Función para actualizar empresa (ahora puede enviar el campo 'estado')
export async function actualizarEmpresa(id: number, empresaData: Partial<EmpresaData>) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT', // Usamos PUT como lo tienes, asegúrate que tu controlador Adonis lo maneje también
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al actualizar empresa');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    throw error;
  }
}

// 4. Nueva función para inactivar una empresa (soft delete)
export async function inactivarEmpresa(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/inactivar`, {
      method: 'PATCH', // Usamos PATCH según lo definido en tus rutas de Adonis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al inactivar empresa');
    }

    return await response.json(); // Puede devolver un mensaje de éxito
  } catch (error) {
    console.error('Error al inactivar empresa:', error);
    throw error;
  }
}

// 5. Nueva función para activar una empresa
export async function activarEmpresa(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/activar`, {
      method: 'PATCH', // Usamos PATCH según lo definido en tus rutas de Adonis
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al activar empresa');
    }

    return await response.json(); // Puede devolver un mensaje de éxito
  } catch (error) {
    console.error('Error al activar empresa:', error);
    throw error;
  }
}

// 6. Nueva función para eliminar permanentemente una empresa
export async function eliminarEmpresaPermanentemente(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}/permanente`, {
      method: 'DELETE', // Usamos DELETE con la ruta específica
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || 'Error al eliminar empresa permanentemente');
    }

    return await response.json(); // Puede devolver un mensaje de éxito
  } catch (error) {
    console.error('Error al eliminar empresa permanentemente:', error);
    throw error;
  }
}

// Puedes eliminar la función 'eliminarEmpresa' original si ya no la necesitas,
// dado que ahora tienes 'inactivarEmpresa' y 'eliminarEmpresaPermanentemente'.
// Si la ruta DELETE original `/empresas/:id` todavía apunta a `destroyPermanently`
// en tu controlador, podrías mantenerla si así lo deseas, pero lo ideal es
// que el frontend use las funciones con nombres más explícitos para evitar confusiones.
// export async function eliminarEmpresa(id: number) { ... }
