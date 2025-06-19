export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)


  const response = await fetch('http://147.93.114.138:8280/upload', {
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
// Replace with actual file initialization


