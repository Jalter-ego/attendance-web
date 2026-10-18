import './BrandBackdrop.css'

type BrandBackdropProps = {
  className?: string
}

/** Gráfica decorativa compartida por los layouts de la aplicación. */
function BrandBackdrop({ className = '' }: BrandBackdropProps) {
  return (
    <div className={`brand-backdrop ${className}`} aria-hidden="true">
      <svg className="brand-backdrop-mark" viewBox="0 0 640 640" fill="none" focusable="false">
        <path
          d="M98 58v230c0 103 117 147 184 66L564 12"
          stroke="currentColor"
          strokeWidth="108"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="brand-backdrop-orbit" />
      <span className="brand-backdrop-circle" />
    </div>
  )
}

export default BrandBackdrop
