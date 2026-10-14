# Control de asistencia · React + Vite

## Desarrollo local

```bash
pnpm install
pnpm dev
```

El frontend usa el puerto 5173. Inicia también `attendance_core` en el puerto 5000
(`pnpm start:dev` en ese proyecto), con su base de datos y migraciones preparadas.
Vite redirige las peticiones `/core/api/v1` a `http://127.0.0.1:5000`, por lo que
el navegador puede usar la API desde cualquiera de los subdominios locales.

## Institución / tenant

- En `http://localhost:5173` se muestra el campo **Institución**. Ingresa su slug,
  por ejemplo `demo`.
- En `http://demo.localhost:5173` el tenant se obtiene del subdominio.
- También se admite `http://wabi.attlasian.test:5173` y
  `http://multicenter.attlasian.test:5173`. En Linux agrega en `/etc/hosts`:

  ```text
  127.0.0.1 demo.attlasian.test wabi.attlasian.test multicenter.attlasian.test
  ```

El subdominio debe coincidir con el `slug` de una institución activa en el backend.
No se crean instituciones automáticamente al visitar una dirección.
El seed actual del backend incluye `demo`; no incluye `wabi` ni `multicenter`.
Para probar ese seed usa `localhost` indicando `demo`, o `demo.localhost`.

Puedes copiar `.env.example` a `.env.local` para configurar:

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | Base de la API, por defecto `/core/api/v1`. Para una API externa usa una URL completa y configura su CORS. |
| `VITE_TENANT_BASE_DOMAIN` | Dominio del que se extrae el tenant, por defecto `attlasian.test`. `*.localhost` siempre se admite. |
| `VITE_DEFAULT_TENANT` | Precompleta el campo Institución en una URL sin subdominio. Nunca reemplaza el tenant de la URL. |

Reinicia Vite después de cambiar variables de entorno. Si cambias el dominio local,
ajusta también `server.allowedHosts` en `vite.config.ts` y la resolución local.
En producción, el proxy de Vite no existe: el servidor web debe redirigir
`/core/api/v1` al backend, o debes configurar `VITE_API_URL` antes de compilar.
Las variables `VITE_*` son públicas: no guardes secretos en ellas.

## Acceso y sesión

- **Administrador:** institución, correo y contraseña → `POST /auth/admin/login`.
- **Estudiante:** institución y correo o número de registro → `POST /auth/student/login`.
- Cada rol tiene una pantalla inicial distinta. Las demás funciones se indican como
  **Próximamente** y todavía no ejecutan operaciones de asistencia o administración.
- El acceso de superadmin queda fuera de esta versión. El login institucional
  siempre envía un tenant no vacío.

**Mantener sesión en este dispositivo** está activado por defecto y usa
`localStorage`. Al desactivarlo se usa `sessionStorage`: la sesión sobrevive a una
recarga y se descarta al terminar la sesión de la pestaña según el navegador.
Solo se guardan el token y los datos devueltos por la API; nunca la contraseña.
El almacenamiento queda separado por origen (incluido el subdominio), y se
comprueba que la institución guardada coincida con la URL.

Al recargar se valida el token con `GET /auth/me` antes de mostrar el panel. Los
errores 401/403/404 descartan la sesión; una caída de red permite reintentar sin
borrarla. El vencimiento del token vuelve al login. No hay renovación automática:
al vencer se deben ingresar los datos de nuevo. Cerrar sesión descarta el token
local y llama a `POST /auth/logout` para registrar la salida. El backend actual
no revoca el JWT: su vigencia termina al vencer.

`localStorage` no es una cookie HttpOnly; evita introducir HTML o scripts no
confiables en la aplicación. La autorización de datos sigue a cargo del backend.

## Verificación

Con Node.js 24 (o una versión con soporte nativo para ejecutar TypeScript):

```bash
pnpm test
pnpm lint
pnpm build
```

Las pruebas verifican los contratos de ambos logins, recuperación de sesión,
separación por tenant, vencimiento, almacenamiento, errores de la API y logout.
Usan respuestas simuladas y no requieren modificar la base de datos.

Prueba manual: inicia sesión como estudiante con el seed `demo` y registro `1001`,
recarga y cierra sesión; repite con una cuenta administrativa de esa institución.
Para comprobar la separación entre instituciones necesitas datos de al menos dos
tenants en el backend.
