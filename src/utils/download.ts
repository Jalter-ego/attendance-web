/**
 * Guarda un blob como archivo.
 *
 * El backend exige `Authorization`, así que no sirve un enlace directo: hay que
 * pedirlo por fetch y entregar el resultado con un enlace temporal. La URL se
 * revoca después para no retener el blob en memoria.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  // Safari necesita que la URL siga viva un instante después del clic
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
