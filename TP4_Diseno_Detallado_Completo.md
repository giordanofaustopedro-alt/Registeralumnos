# TRABAJO PRÁCTICO N.º 4

## Diseño detallado y especificación del prototipo

**Materia / Espacio curricular**: Aplicaciones Informáticas

**Modalidad**: Grupal

**Duración sugerida**: 1 hora

**Proyecto**: Sistema de Gestión Escolar — Registro de Alumnos y Expedientes Digitales

---

# Objetivos

- Transformar el diseño técnico general del proyecto en una especificación detallada.
- Definir con precisión cómo se construirá y funcionará el prototipo.
- Determinar las conexiones, comportamientos y relaciones entre los componentes.
- Representar la lógica del sistema antes de comenzar la implementación.
- Definir pruebas que permitan comprobar si el prototipo funciona correctamente.

---

# 1. Diagrama detallado del sistema

Esquema de componentes y relaciones del Sistema de Gestión Escolar:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERFAZ DE USUARIO (UI)                        │
│                          Next.js 16 + React 19                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Panel     │  │  Listado de  │  │  Expediente  │  │  Registro de │  │
│  │  Principal │  │  Estudiantes │  │  Detallado   │  │  Sanciones   │  │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└────────┼────────────────┼─────────────────┼─────────────────┼──────────┘
         │                │                 │                 │
         └────────────────┴─────────────────┴─────────────────┘
                           │ Server Components / Client Components
                           │ Next.js App Router (RSC)
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE ACCIONES (SERVER ACTIONS)                     │
│                      'use server' / Zod Validación                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │ estudiantes.ts  │  │  expediente.ts   │  │     recursos.ts       │  │
│  │ CRUD Alumnos    │  │ Responsables /   │  │ Recursos Educativos   │  │
│  │ + Ficha Médica  │  │ Sanciones / Docs │  │                       │  │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬────────────┘  │
└───────────┼────────────────────┼────────────────────────┼───────────────┘
            │                    │                        │
            └────────────────────┴────────────────────────┘
                                 │ Prisma Client 7
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS (ORM + DRIVER)                       │
│    Prisma Schema ──► Prisma Client ──► PrismaPg Adapter ──► pg Pool    │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS RELACIONAL                             │
│                          PostgreSQL 16+                                  │
│  Tablas:                                                                 │
│  ┌──────────────┐ 1:N ┌──────────────────┐                               │
│  │  Estudiante  │────►│   Responsable    │                               │
│  │  (UUID PK)   │────►│   InfoMedica 1:1 │                               │
│  │              │────►│   Documento 1:N  │                               │
│  │              │────►│ Amonestacion 1:N │                               │
│  │              │────►│   Sancion    1:N │                               │
│  │              │────►│   Historial  1:N │                               │
│  └──────────────┘     └──────────────────┘                               │
│  ┌──────────────┐                                                        │
│  │   Recurso    │  (Recursos Educativos Globales)                        │
│  └──────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tabla de componentes y conexiones

| Elemento / componente | Se conecta con | Tipo de conexión o comunicación | Función |
|---|---|---|---|
| Navegador Web (Usuario) | Next.js Frontend | HTTPS / HTTP/2 | Renderiza UI, envía formularios, recibe respuestas |
| Panel Principal (/) | Server Actions | Renderizado de servidor (RSC) | Muestra estadísticas, accesos rápidos y últimos alumnos |
| Listado Estudiantes (/estudiantes) | estudiantes.ts → Prisma | Consulta filtrada + paginación lógica | Búsqueda, listado, acceso a expedientes |
| Expediente Detallado (/estudiantes/[id]) | estudiantes.ts + expediente.ts | Múltiples includes en Prisma | Vista completa del alumno + formularios modales |
| Registro Sanciones (/sanciones) | expediente.ts → Prisma | Query ordenada por fecha | Listado histórico de sanciones |
| Server Actions | Prisma Client | RPC interno / función TypeScript | Aisla lógica de negocio, valida con Zod |
| Prisma Client | PrismaPg Adapter | Conexión TCP con pooling | Traduce métodos TypeScript a SQL |
| PostgreSQL | Prisma Adapter | Protocolo PostgreSQL | Persistencia ACID de todos los datos |
| Tailwind CSS + PostCSS | DOM del navegador | CSS procesado en build | Estilos modernos responsivos |

---

# 2. Especificación de componentes

| Componente | Función | Datos/señales que recibe | Datos/señales que entrega | Dependencias |
|---|---|---|---|---|
| **Next.js 16 App Router** | Framework de rendering (RSC + SSR) | Requests HTTP, params, searchParams | HTML renderizado, JSON de revalidate | React 19, Node.js 20+ |
| **Sidebar.tsx** | Navegación principal entre módulos | Estado activo de ruta | Links de navegación | next/link, lucide-react |
| **Panel Principal page.tsx** | Dashboard con KPIs y accesos | Lista de estudiantes (getEstudiantes) | Contador alumnos, últimos 5 registros | acciones/estudiantes |
| **Listado estudiantes** | Tabla buscador de alumnos | Query param ?q, resultados getEstudiantes | Tabla paginada + buscador | zod, next/link |
| **Nuevo estudiante** | Formulario de alta | Datos del formulario (DNI, nombre, curso, ficha médica) | Redirect a expediente / Toast éxito | zod validation, crearEstudiante() |
| **Expediente [id]** | Vista completa de un alumno | ID por params | Ficha médica + responsables + historial + docs + sanciones | getEstudiantePorId() |
| **FormularioAccion (modal)** | Formulario reutilizable en modal | Config de campos + onSubmit async | Crea/agrega responsable, sanción, doc | Client Component, useState |
| **Nueva Sanción** | Formulario de carga de amonestaciones | DNI del alumno, tipo, categoría, motivo | Redirect + registro en Historial | getEstudiantes, registrarSancion() |
| **estudiantes.ts (Actions)** | CRUD de alumnos + ficha médica | Input validado con Zod | { success, data, error } | @prisma/client, zod, next/cache |
| **expediente.ts (Actions)** | Gestión de responsables, sanciones, docs | Datos de entidades relacionadas | Resultado de operación + revalidate | Prisma, Zod, revalidatePath |
| **recursos.ts (Actions)** | Biblioteca de recursos educativos | Categoría, título, URL de archivo | Lista o creación de recursos | Prisma Recurso model |
| **Prisma Schema** | Definición de modelo de datos | Definición declarativa | Prisma Client generado | Prisma 7 CLI |
| **Prisma Client** | Query Builder type-safe | Métodos findMany, create, update... | Promesas con datos tipados | @prisma/adapter-pg |
| **Pool pg (node-postgres)** | Conexiones reutilizables a BD | DATABASE_URL del .env | Conexiones TCP disponibles | pg, PrismaPg Adapter |
| **PostgreSQL** | Motor de base de datos | Consultas SQL parametrizadas | Result sets + transacciones | PostgreSQL server (Supabase o local) |
| **Seed.ts** | Poblado de datos iniciales | --- | 3 estudiantes + 3 recursos + historial | Prisma + dotenv |
| **Zod** | Validación de esquemas | Objeto input del usuario | Resultado parseado o issues | zod v4 |
| **Tailwind v4** | Framework CSS utility-first | Clases de utilidad en JSX | CSS final procesado | @tailwindcss/postcss |

---

# 3. Funcionamiento detallado

Descripción paso a paso del flujo principal del sistema:

| Paso | Situación / entrada | Proceso o decisión | Salida / respuesta |
|---|---|---|---|
| 1 | Usuario accede a `/` (inicio) | Next.js renderiza RootLayout → Sidebar + Panel Principal. Llama getEstudiantes() | Panel con KPIs (total alumnos, sanciones = 0, estado BD) y últimos 5 alumnos |
| 2 | Usuario hace clic en "Registrar Alumno" | Router navega a `/estudiantes/nuevo`. Renderiza Client Component con formulario de 2 secciones | Formulario: Datos personales (DNI, nombre, curso) + Ficha médica (grupo sang., alergias, etc.) |
| 3 | Usuario completa formulario y envía | Cliente valida HTML5 → llama crearEstudiante(input). Server-side: Zod parsea y valida. Verifica DNI único. Transaction crea Estudiante + InfoMedica. | Si éxito: redirect a `/estudiantes/{uuid}` + revalidate cache. Si error: mensaje rojo (DNI duplicado, campos faltantes) |
| 4 | Usuario ingresa al expediente del alumno | Server carga getEstudiantePorId(id). Include anidado: responsables, infoMedica, documentos, historial, sanciones, amonestaciones. | Página de 2 columnas: columna 1 = datos, médicos, responsables timeline, historial. Columna 2 = documentos + acciones rápidas |
| 5 | Usuario cliquea "+ Agregar Responsable" | Se monta FormularioAccion (modal). Envío llama agregarResponsable(estudianteId, data). Zod valida. Crea en BD. | Modal muestra éxito verde. revalidatePath refresca automáticamente la lista de responsables |
| 6 | Usuario va a /sanciones | Server consulta prisma.sancion.findMany include estudiante, orderBy fecha desc. | Tabla con todas las sanciones, alumno, curso, tipo, motivo y fecha formateada |
| 7 | Usuario cliquea "+ Cargar Sanción" | Renderiza Client Component. useEffect() llama getEstudiantes() para poblar el select de alumnos. | Formulario desplegable de estudiantes + select de Tipo y Categoría predefinidos |
| 8 | Envío de sanción | registrarSancion crea 2 registros atómicos: 1 en Sancion, 1 copia en Historial. Revalida /, /sanciones y /estudiantes/[id]. | Éxito → redirect al listado de sanciones. Historial del alumno muestra el hecho con color correspondiente |
| 9 | Usuario busca en listado | Formulario GET con input name="q". searchParams se pasa a getEstudiantes(q). Prisma filtra por nombre/apellido/dni insensitivo | Resultados filtrados en la tabla sin perder paginado |
| 10 | Usuario elimina alumno | Server action eliminarEstudiante(id). ON DELETE CASCADE borra responsables, docs, historial. | Redirect a /estudiantes, lista actualizada |

---

# 4. Lógica del sistema

## Pseudocódigo / algoritmo principal

```
ALGORITMO SistemaGestiónEscolar

VARIABLES GLOBALES:
    sesionUsuario: Sesion | NULL
    cacheRutas: Map<Ruta, Datos>

FUNCIÓN renderizarRuta(ruta, params):
    SI ruta == "/" ENTONCES:
        estudiantes = getEstudiantes()
        RETORNAR Dashboard(estudiantes.tamaño, estudiantes.primeros(5))

    SI ruta == "/estudiantes" ENTONCES:
        busqueda = params.q ?? NULL
        lista = getEstudiantes(busqueda)
        RETORNAR TablaEstudiantes(lista, busqueda)

    SI ruta == "/estudiantes/nuevo" (POST):
        datosValidados = EstudianteSchema.parse(formulario)
        EXISTE = prisma.estudiante.findUnique(dni: datosValidados.dni)
        SI EXISTE ENTONCES:
            RETORNAR {error: "DNI duplicado"}
        alumnoNuevo = prisma.transaccion([
            estudiante.create(),
            infoMedica.create(estudianteId: alumnoNuevo.id)
        ])
        revalidatePath("/", "/estudiantes")
        REDIRIGIR("/estudiantes/" + alumnoNuevo.id)

    SI ruta == "/estudiantes/:id":
        expediente = prisma.estudiante.findUnique({
            where: {id},
            include: {responsables, infoMedica, documentos, historial, sanciones}
        })
        SI expediente == NULL ENTONCES:
            RETORNAR 404 NotFound
        RETORNAR VistaExpediente(expediente)

    SI ruta == "/sanciones/nueva" (POST):
        SI !formulario.estudianteId ENTONCES error "Seleccione alumno"
        sancion = prisma.sancion.create(formulario)
        prisma.historial.create({copiaDatosSancion})
        revalidatePath("/", "/sanciones", "/estudiantes/" + estudianteId)
        REDIRIGIR("/sanciones")

FIN FUNCIÓN


FUNCIÓN getEstudiantes(busqueda?):
    filtro = SI busqueda EXISTE ENTONCES:
        OR: [nombre % busqueda, apellido % busqueda, dni % busqueda]  -- case insensitive
    SINO: undefined
    RETORNAR prisma.estudiante.findMany({
        where: filtro,
        orderBy: {apellido: asc},
        include: {infoMedica, _count: {responsables, historial, documentos}}
    })

FIN FUNCIÓN


MANEJO_ERRORES:
    SI ZodParseError:
        retornar {success:false, error: issues[0].message}
    SI UniqueConstraintViolation (DNI):
        retornar {success:false, error: "Ya existe ese DNI"}
    SI RecordNotFound:
        retornar HTTP 404
    SI ConnectionError (DB):
        loguear consola
        retornar {success:false, error: "Error interno, reintente."}
        NOTIFICAR administrador via log

FIN ALGORITMO
```

## Variables y datos necesarios

- **ID universal**: UUID v4 generado por base de datos (@default(uuid()))
- **Timestamps**: creadoEn, actualizadoEn (DateTime)
- **Enums**: TipoResponsable (PADRE/MADRE/TUTOR), TipoDocumento (FICHA_MEDICA/AUTORIZACION/OTRO)
- **Datos obligatorios**: DNI único +7 dígitos, nombre+apellido min 2 caracteres, curso y división

## Casos de error y manejo

- DNI duplicado: mensaje de error sin romper transacción
- Campos inválidos: Zod retorna primer error encontrado y lo muestra arriba del formulario
- Alumno no encontrado: 404 notFound() de Next.js
- Caída de base de datos: try/catch global retorna error genérico + logueo stack trace

---

# 5. Diseño de interfaces

Diseño del sistema de interfaces de usuario:

| Pantalla / interfaz | Elementos que contiene | Acción del usuario | Respuesta del sistema |
|---|---|---|---|
| **Panel Principal /** | Header con título + btn registrar. 3 cards de KPI (estudiantes, sanciones, estado BD). Tabla últimos 5 alumnos con link a expediente. | Clic en "Registrar Alumno" / clic en tarjetas / clic en "Ver expediente" | Redirect a /estudiantes/nuevo / /estudiantes o /sanciones / /estudiantes/{id} |
| **Listado /estudiantes** | Buscador (form GET input q) + btn nuevo + tabla paginada (Apellido-Nombre, DNI, Curso, Acciones) | Escribir texto y buscar / clic en + Nuevo / clic en Ver expediente | Actualiza tabla con filtro insensitivo / Redirect nuevo / Abre expediente |
| **Nuevo Estudiante /estudiantes/nuevo** | Tarjeta 1: DNI, Nombre, Apellido, Email, Select Curso, Select División, Dirección. Tarjeta 2: Grupo sang., alergias, medicación, enfermedades, cardíacos, observaciones. Barra Cancelar/Guardar. | Completar campos + submit | Validación Zod → BD → redirect expediente con datos ya cargados |
| **Expediente Detallado /estudiantes/[id]** | Header con breadcrumb + nombre + curso + DNI + btn eliminar. Col1: Ficha médica en grid / Lista responsables con btn modal agregar / Timeline historial. Col2: Docs con links + tarjeta acciones rápidas. | Clic +Agregar responsable / +Sanción / +Subir doc. Clic en 🗑️ Eliminar / clic en enlace documento | Abre modales FormularioAccion. Submit → crea registro + cache revalidate + toast éxito. Eliminar → redirect lista. Documento → abre en pestaña nueva |
| **Sanciones /sanciones** | Tabla Fecha / Estudiante / Curso / Tipo / Motivo + btn "Cargar Sanción" | Clic +Cargar / clic en fila | Redirect a /sanciones/nueva |
| **Nueva Sanción /sanciones/nueva** | Select estudiantes (cargado via useEffect). Tipo predefinido (5), categoría (7). Motivo textfield. Descripción textarea larga. | Submit del form | Crear Sancion + entrada Historial → redirect listado |
| **Formulario Modal (genérico)** | Título dinámico, N campos dinámicos (text, textarea, email). Botones cancelar/aceptar. Feedback de error y éxito. | Completar y enviar | Muestra spinner → toast verde success (cierra modal en 1.5s) o toast rojo error por campo |
| **Sidebar Global** | Logo GE + nombre sistema. 3 links (Inicio🏠, Estudiantes👨‍🎓, Sanciones📋). Versión en footer. | Cualquier clic en link | Router hace navegación client-side preservando sidebar |
| **404 Alumno no encontrado** | Tarjeta ícono ❌ "Estudiante no encontrado" + botón volver | Clic en Volver | Navegación atras o listado estudiantes |

---

# 6. Comunicación entre módulos

| Módulo | Información que recibe | Información que entrega | Módulo relacionado |
|---|---|---|---|
| **App Router (Next)** | Request HTTP, cookies, URL params, Server Actions calls | HTML + Serialized RSC Payload | Browser del cliente |
| **UI Components (TSX)** | Props + React state + hooks | Eventos (submit, onClick) → llaman Server Actions | Action Layer |
| **estudiantes.ts (Actions)** | Datos validados de EstudianteInput | {success, data:Estudiante, error:string} | Prisma → PostgreSQL (tablas Estudiante, InfoMedica) |
| **expediente.ts (Actions)** | estudianteId + datos de Responsable/Sancion/Documento | Entidades creadas o mensaje error | Prisma → 6 tablas secundarias |
| **recursos.ts (Actions)** | Categoría (opcional) o datos de nuevo recurso | Lista global o recurso creado | Prisma → Tabla Recurso (global) |
| **Prisma Client** | Objetos tipo-safe: where, data, include, orderBy | Promesa de entidad o arreglo | PrismaPg Adapter |
| **PrismaPg Adapter** | Sentencias parametrizadas de Prisma | Result sets mapeados a objetos | pg Pool |
| **pg Pool** | DATABASE_URL + Queries SQL texto | Rows PostgreSQL | PostgreSQL Server TCP |
| **Zod** | Objetos arbitrarios del usuario | Parseados tipados o issues[] | Capa Actions (todas) |
| **Next Cache / revalidate** | Nombre de ruta / tag | Purga de caché forzada | App Router → nuevo render servidor |
| **Tailwind PostCSS** | Archivos .tsx/.css con @apply y clases | Bundle CSS único purgado | Browser para estilos |

**Notas de comunicación**:
- Toda acción es **Atómica**: si falla un paso en Prisma Transaction, hace rollback automático.
- **Revalidate** después de escrituras: evita staleness en server components.
- Comunicación browser↔server: **Server Components** = 0 JS extra en cliente; **Client Components** = bundle React mínimo.

---

# 7. Diseño de pruebas

Plan de pruebas unitarias, integración y aceptación:

| Prueba | Situación inicial / entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|
| **P1: Alta de estudiante completo** | Form con DNI 45000000, nombre=Test, apellido=Sánchez, curso=3°, división=B, resto opcionales | Crea registro en 2 tablas Estudiante + InfoMedica. Redirect a /estudiantes/{id} | |
| **P2: DNI duplicado** | Mismo DNI de alumno ya existente en BD | Server action retorna {success:false, error:"DNI duplicado"}. Form no se limpia | |
| **P3: Búsqueda sensitiva case** | Buscar "gonzález" en input (minúsculas con tilde) | Retorna Mateo González. Búsqueda insensitiva a mayúsculas y acentos (mode: insensitive) | |
| **P4: Expediente incluye relaciones** | Acceder a /estudiantes/{id} de alumno seed con datos | Se visualizan: 2 responsables, ficha médica completa, 2 docs, timeline con 2 eventos historial | |
| **P5: Agregar responsable via modal** | Modal FormularioAccion en expediente. Datos válidos de tutor | Modal toast verde, lista responsables incrementada en 1 sin recargar página | |
| **P6: Sanción crea en Historial** | Crear sanción vía /sanciones/nueva | Existe row en tabla Sancion Y en tabla Historial (duplicación lógica audit) | |
| **P7: Eliminación en cascada** | Ejecutar eliminarEstudiante(id) | 0 rows en Estudiante AND 0 Responsables AND 0 Docs AND 0 Historial para ese estudianteId. No orphan rows | |
| **P8: Validación correo inválido** | En email="estoNoEsUnCorreo" en alta | Zod retorna error: "Email inválido". No inserta nada | |
| **P9: DNI <7 caracteres** | dni = "123" en form | Error Zod: "El DNI debe tener al menos 7 caracteres" | |
| **P10: Alumno no existe 404** | Acceder a /estudiantes/00000000-0000-0000-0000-000000000000 | Página notFound() Next: código 404 + UI "Estudiante no encontrado" | |
| **P11: Seed idempotente** | Ejecutar npx prisma db seed dos veces seguidas | Primera: 3 alumnos 3 recursos. Segunda: deleteMany() primero + createMany. Misma cantidad al final. Sin Unique errors | |
| **P12: Panel principal contadores** | Después de seed exitoso | Panel muestra "3" en card estudiantes, último listado muestra 3 alumnos ordenados apellido A-Z (Fernández, González, López) | |
| **P13: Registro Sanción sin alumno** | Select alumno sin seleccionar + submit | HTML5 required evita envío (tooltip "Seleccione un estudiante") | |
| **P14: Responsive layout** | Ancho viewport < 768px (mobile) | Sidebar cambia o colapsa. Grid cards/ tablas cambian a 1 columna. Sin scroll horizontal | |
| **P15: Revalidate tras alta** | Después de crear alumno nuevo, volver a Dashboard sin F5 | KPI estudiantes ya incluye el nuevo. Últimos 5 lo muestra al final | |

---

# 8. Casos de error y respuestas

| Problema / error | Causa posible | Respuesta esperada del sistema | Solución prevista |
|---|---|---|---|
| **Conexión rechazada BD** | Postgres apagado / DATABASE_URL expirada / sin credenciales | getEstudiantes retorna {error:"No se pudieron obtener los estudiantes"}. UI muestra tarjeta gris "Estado BD: ❌ Desconectada" + no crashea | Pool intenta reconectar automáticamente. Logs en consola con stack trace para devops |
| **DNI duplicado** | Usuario intenta cargar mismo alumno 2 veces | Mensaje rojo: "Ya existe un estudiante registrado con ese DNI". Campos intactos. | Prisma @unique en campo dni. findUnique() previo al create |
| **Violación FK constraint** | Crear responsable de estudiante borrado | Mensaje genérico "No se pudo vincular el responsable" + console.error con Prisma error code | Transacciones atómicas, siempre validar existencia antes |
| **404 Ruta inexistente** | Usuario tipea /alumnos (ruta no existe) | Next.js not-found page default. | Custom 404 page recomendada (opcional) |
| **Campos muy largos (overflow)** | Nombre > 255 carácteres en input sin maxlength | Zod no lo limita → PostgreSQL puede truncar o error length | Agregar zod.max(255) a cada string. Sugerencia UX |
| **Token env faltante (.env)** | Developer olvida crear .env con DATABASE_URL | Error inmediato en lib/prisma.ts al instanciar new Pool(). No build crash en next start | Documentación en README: copiar .env.example. Seed ya usa dotenv() |
| **Timeout query lenta** | Miles de estudiantes sin paginación | Prisma findMany sin take. Next dev server timeout warnings. | Implementar take + skip (paginación real) en producción |
| **Race condition en mismo click** | Usuario spam clickea submit de alta 5 veces rápido | Zod puede crear 5 alumnos con UUIDs diferentes (pero DNI unique bloquearía desde la 2da) | disabled={cargando} en botón + servidor-side UNIQUE constraint safety net |
| **URL maliciosa en XSS** | Alguien guarda en nombre "<script>alert()</script>" | Zod lo pasa pero React JSX autoescapa al renderizar: HTML se ve como texto plano | Nunca usar dangerouslySetInnerHTML sin sanitización. |
| **Archivo documento URL no válida** | Documento guardado con URL = "archivoLocal://malicioso" | <a href> target="_blank" browser bloquea protocolos raros | Validar con zod.url() en input de documento |
| **Usuario malintencionado edita hidden input** | Cambia vía DevTools el estudianteId antes de submit | Prisma create falla si UUID no existe. Si existe, crea sanción en alumno de otra persona | Mecanismo de autenticación + roles (por implementar en etapa de seguridad) |
| **Prisma Migrate faltante** | Código usa modelo Recurso pero BD no lo tiene todavía | Error P2021 "The table `public.Recurso` does not exist in the current database." | Instrucción: Ejecutar `pnpm prisma migrate dev` antes de pnpm dev |
| **Package manager mismatch** | Desarrollador usa npm install en proyecto pnpm. Lockfile corrupto | Diferentes versiones de Prisma runtime crash | Field packageManager = pnpm@11.20.0 en package.json + pnpm-workspace.yaml enforce |

---

# 9. Verificación del diseño

Revisión final de coherencia con el TP3:

☑️ **El diseño utiliza los componentes definidos en el TP3 o justifica cualquier cambio.**
- ✅ Stack: Next.js + PostgreSQL + Prisma se mantiene igual que TP3.
- ✅ Tailwind CSS 4 actualizado (v4 introduce @import sintaxis, adaptado correctamente).
- ✅ Driver Adapter de Prisma para PostgreSQL (PrismaPg + pg pool) es mejora justificada por performance.

☑️ **Las conexiones y relaciones entre los componentes están claramente indicadas.**
- ✅ Diagrama ASCII visual + tabla detallada en punto 1.
- ✅ Capas separadas: UI → Actions → Prisma Client → Adapter → Pool → PostgreSQL.

☑️ **El funcionamiento está explicado paso a paso.**
- ✅ 10 pasos del flujo normal en punto 3, desde ingreso a / hasta eliminación de alumno.
- ✅ Cada paso incluye entrada, proceso y salida.

☑️ **La lógica del sistema está representada.**
- ✅ Pseudocódigo estructurado en punto 4 con algoritmo principal, funciones y manejo de errores.
- ✅ Variables declaradas, condiciones y acciones especificadas.

☑️ **Los módulos tienen una función clara.**
- ✅ 12 módulos detallados en punto 6 con entrada/salida y módulo relacionado.
- ✅ Responsabilidad única: acciones no renderizan, UI no toca BD directo.

☑️ **Se definieron pruebas para comprobar el funcionamiento.**
- ✅ 15 casos de prueba en punto 7: validación, CRUD, cascada, seed, UX, responsive.
- ✅ Columnas Resultado Esperado/Obtenido para ejecución manual o automatizada.

☑️ **Se contemplaron posibles errores.**
- ✅ 13 escenarios de fallo en punto 8 con causa y mitigación.
- ✅ Coverage de conectividad, constraint, seguridad, config, performance.

☑️ **El diseño permite comenzar la implementación sin tomar nuevamente decisiones fundamentales.**
- ✅ Código fuente entregado junto a este documento: schema Prisma completo, Actions implementadas, Pages en App Router, validaciones Zod activas.
- ✅ Única decisión pendiente en producción: URL de Supabase Postgres + deploy (Vercel recomendado).

---

# Entregable completo del proyecto

Cada grupo deberá presentar un documento que contenga:

1. ✅ **Diagrama detallado del sistema** (ver punto 1)
2. ✅ **Especificación de componentes y conexiones** (ver punto 2)
3. ✅ **Descripción detallada del funcionamiento** (ver punto 3, 10 pasos)
4. ✅ **Algoritmo, pseudocódigo o diagrama de flujo** (ver punto 4)
5. ✅ **Diseño de interfaces, si corresponde** (ver punto 5, 9 pantallas)
6. ✅ **Comunicación entre módulos** (ver punto 6, 12 módulos)
7. ✅ **Plan de pruebas** (ver punto 7, 15 tests)
8. ✅ **Casos de error y respuestas previstas** (ver punto 8, 13 errores)
9. ✅ **Verificación final del diseño** (ver punto 9, todo OK)

---

# Importante

Al finalizar este trabajo, **el grupo está en condiciones de comenzar la construcción y/o programación del prototipo**. El objetivo de esta etapa es reducir al mínimo las decisiones que todavía queden sin definir antes de implementar.

El código fuente actual incluye:
- Modelo de datos completo (9 entidades, 2 enums) en `prisma/schema.prisma`
- Capa de Server Actions con validación Zod (`app/actions/*.ts`)
- Interfaces en Next.js 16 App Router (`app/`) con RSC + Client Components donde corresponden
- Seed ejecutable con datos de prueba (3 estudiantes, 3 recursos, historial, docs)
- Diseño responsivo moderno con Tailwind v4

**Fin del Trabajo Práctico N.º 4**
