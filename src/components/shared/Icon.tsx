/* Iconos SVG en línea, trazo uniforme de 1.75 y rejilla de 24.
 *
 * Van inline en vez de una librería para no agregar dependencia ni una petición
 * más, y para que hereden `currentColor` y el tamaño del contenedor.
 *
 * Son decorativos: el texto al lado ya nombra la acción, así que llevan
 * `aria-hidden`. Un botón sin texto visible necesita su propio `aria-label`.
 */

export type IconName =
  | 'home'
  | 'users'
  | 'grid'
  | 'layers'
  | 'history'
  | 'logout'
  | 'download'
  | 'upload'
  | 'check'
  | 'x'
  | 'clock'
  | 'calendar'
  | 'search'
  | 'chevronRight'
  | 'chevronLeft'
  | 'arrowLeft'
  | 'alert'
  | 'info'
  | 'menu'
  | 'plus'
  | 'spark'

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5M9.5 20v-5.5h5V20',
  users: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM20 19v-1.5a3.5 3.5 0 0 0-2.75-3.42M15.5 4.2a3.25 3.25 0 0 1 0 6.1',
  grid: 'M4 9.5h16M4 15h16M9.5 4.5v15M4.5 4.5h15v15h-15z',
  layers: 'M12 3.5 3.5 8l8.5 4.5L20.5 8 12 3.5ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5',
  history: 'M3.8 12a8.2 8.2 0 1 0 2.6-6M3.5 4.5V10h5.5M12 8v4.3l3 1.8',
  logout: 'M15 4.5h3.5v15H15M11.5 15.5 15 12l-3.5-3.5M15 12H4.5',
  download: 'M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 18.5h15',
  upload: 'M12 15.5v-11M7.5 8.5 12 4l4.5 4.5M4.5 18.5h15',
  check: 'M5 12.5 9.5 17 19 7',
  x: 'M6 6l12 12M18 6 6 18',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.5V12l3 1.8',
  calendar: 'M4.5 7.5h15v12h-15zM4.5 11.5h15M8.5 4.5v4M15.5 4.5v4',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20',
  chevronRight: 'M9.5 5.5 16 12l-6.5 6.5',
  chevronLeft: 'M14.5 5.5 8 12l6.5 6.5',
  arrowLeft: 'M19 12H5M10.5 6.5 5 12l5.5 5.5',
  alert: 'M12 3.5 2.5 20h19L12 3.5ZM12 9.5v4.5M12 17h.01',
  info: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 11v5.5M12 7.8h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  plus: 'M12 5v14M5 12h14',
  spark: 'M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9L12 3.5Z',
}

type IconProps = {
  name: IconName
  /** Lado del cuadro, en px. Por defecto 18 */
  size?: number
  className?: string
}

function Icon({ name, size = 18, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={PATHS[name]}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
      />
    </svg>
  )
}

export default Icon
