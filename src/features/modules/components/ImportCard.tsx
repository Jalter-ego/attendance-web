import { useId, useState, type FormEvent } from 'react'
import { ApiError, type ImportErrorRow } from '../../../lib/api'
import './ImportCard.css'

type ImportCardProps = {
  title: string
  /** Encabezados que debe tener la primera fila del Excel, tal como los busca el API */
  columns: string[]
  note?: string
  /** Cuántos registros tiene cargados el borrador ahora */
  loaded: number
  loadedLabel: (count: number) => string
  onUpload: (file: File) => Promise<number>
}

type Result =
  | { type: 'success'; text: string }
  | { type: 'error'; text: string; rows: ImportErrorRow[] }

/**
 * Subida de un Excel al borrador (RF-11, RF-12). Si el API lo rechaza con 422,
 * muestra fila por fila qué hay que corregir; en ese caso no se guardó nada.
 */
function ImportCard({ title, columns, note, loaded, loadedLabel, onUpload }: ImportCardProps) {
  const inputId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || uploading) return
    // Después del await, `event.currentTarget` ya no apunta al formulario
    const form = event.currentTarget
    setUploading(true)
    setResult(null)
    try {
      const imported = await onUpload(file)
      setResult({ type: 'success', text: `Se importaron ${loadedLabel(imported)} desde «${file.name}».` })
      setFile(null)
      form.reset()
    } catch (error) {
      setResult(error instanceof ApiError
        ? { type: 'error', text: error.message, rows: error.importErrors }
        : { type: 'error', text: 'No pudimos subir el archivo. Inténtalo de nuevo.', rows: [] })
    } finally {
      setUploading(false)
    }
  }

  return (
    <article className="import-card">
      <header className="import-card-header">
        <h3>{title}</h3>
        <span className={`import-count${loaded > 0 ? ' is-loaded' : ''}`}>
          {loaded > 0 ? loadedLabel(loaded) : 'Sin cargar'}
        </span>
      </header>

      <p className="import-columns">
        Columnas: {columns.map((column, index) => (
          <span key={column}>{index > 0 && ', '}<code>{column}</code></span>
        ))}
      </p>
      {note && <p className="import-note">{note}</p>}

      <form className="import-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="visually-hidden" htmlFor={inputId}>Archivo Excel para {title.toLowerCase()}</label>
        <input
          id={inputId}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResult(null) }}
          disabled={uploading}
        />
        <button className="import-button" type="submit" disabled={!file || uploading}>
          {uploading ? 'Importando…' : loaded > 0 ? 'Reemplazar' : 'Importar'}
        </button>
      </form>

      {result?.type === 'success' && <p className="page-feedback page-feedback--success" role="status">{result.text}</p>}

      {result?.type === 'error' && (
        <div className="import-errors" role="alert">
          <p className="page-feedback page-feedback--error">
            {result.text}{result.rows.length > 0 && '. No se guardó nada: corrige estas filas y vuelve a subirlo.'}
          </p>
          {result.rows.length > 0 && (
            <div className="import-errors-wrap">
              <table className="import-errors-table">
                <thead>
                  <tr><th scope="col">Fila</th><th scope="col">Columna</th><th scope="col">Problema</th></tr>
                </thead>
                <tbody>
                  {result.rows.map((row, index) => (
                    <tr key={`${row.row}-${row.field}-${index}`}>
                      <td>{row.row}</td>
                      <td>{row.field}</td>
                      <td>{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default ImportCard
