export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)


  const response = await fetch('http://localhost:3333/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include', // si usas cookies para sesión
  })

  if (!response.ok) {
    throw new Error(`Error al subir archivo: ${response.statusText}`)
  }

  const data = await response.json()
  return data // Aquí debería venir { url: 'https://...' }
}
// Define the file variable before using it
const file = new File([""], "filename.txt"); // Replace with actual file initialization
const {url} = await uploadFile(file)

console.log('📸 URL subida:', url)

console.log('Enviando al backend la URL:', url)

// Ahora le dices al backend: guarda esta URL como foto de perfil
await fetch('http://localhost:3333/usuarios/profile-picture-url', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // si usas sesión, sino puedes quitarlo
  body: JSON.stringify({
    userId: 'el-id-del-usuario', // ¡debes pasar el ID del usuario!
    url,
  }),
})
