# Decisiones Técnicas
## Bryan Macias

> **Nota**: Este es un archivo opcional pero recomendado. Documentar tus decisiones técnicas demuestra pensamiento crítico y puede sumar puntos extra en la evaluación.

---

## 📋 Información General

- **Nombre del Candidato**: Bryan German Macias Sellan
- **Fecha de Inicio**: 27/12/2025
- **Fecha de Entrega**: 27/12/2025
- **Tiempo Dedicado**: 30 horas

---

## 🛠️ Stack Tecnológico Elegido

### Global

- pnpm: Performant NPM. Mas rapido y mas ligero que NPM
- biome: Unificacion de estilo de codigo en todo el repo

### Backend

| Tecnología | Versión | Razón de Elección |
|------------|---------|-------------------|
| Node.js | 24.x | Versiones pares tienen mayor tiempo de mantenimiento, version 22 ya entro en mantenimiento y la version 24 es LTS |
| Express | 5.x | Mejoras respecto a 4.x |
| Base de Datos | MySQL | Dado el contexto del proyecto, es algo mas sencillo de usar, devs tendran menor tiempo de adaptacion |
| ORM/ODM | Prisma | Manejo de migraciones, ecosistema maduro |
| Validación | Zod | Soporte nativo con Typescript |
| Testing | Vitest | Destaca por su rapidez y su soporte nativo de Typescript |

### Frontend

| Tecnología | Versión | Razón de Elección |
|------------|---------|-------------------|
| React | 19.x | Última versión estable con mejoras de rendimiento y nuevas características |
| Build Tool | Vite | Excelente DX, HMR ultrarrápido y soporte nativo de ESM |
| Estado Global | Context API | Suficiente para el scope del proyecto, evita dependencias adicionales |
| Estilos | TailwindCSS | Muy fácil de crear layouts, utility-first approach |
| UI Library | Ant Design | Madurez comprobada en producción, gran cantidad de componentes empresariales |
| Formularios | Ant Design Form | Excelente DX y soporte con Ant Design, validación integrada |

---

## 🏗️ Arquitectura

### Estructura del Backend

```
backend/
├── src/
│   ├── domain/              # Capa de dominio (entidades y reglas de negocio)
│   │   ├── entities/        # Entidades del dominio (User, Project, Task, Person)
│   │   ├── errors/          # Errores custom del dominio
│   │   └── repositories/    # Interfaces de repositorios
│   ├── application/         # Capa de aplicación (casos de uso)
│   │   ├── dtos/           # Data Transfer Objects (Request/Response)
│   │   └── use-cases/      # Casos de uso (RegisterUseCase, LoginUseCase, etc.)
│   ├── infrastructure/      # Capa de infraestructura (implementaciones)
│   │   ├── prisma/         # Cliente de Prisma
│   │   ├── repositories/   # Implementaciones de repositorios (PrismaUserRepository, etc.)
│   │   └── services/       # Servicios técnicos (JwtService, PasswordHashService)
│   └── presentation/        # Capa de presentación (API REST)
│       ├── controllers/     # Controladores (AuthController, ProjectController, etc.)
│       ├── middlewares/     # Middlewares (authenticate, errorHandler)
│       ├── routes/         # Definición de rutas
│       ├── validators/     # Validadores Zod
│       └── types/          # Tipos de TypeScript para la capa de presentación
├── tests/
│   ├── integration/        # Tests de integración por feature
│   └── helpers/            # Utilidades para tests (mocks, factories)
└── prisma/
    ├── schema.prisma       # Schema de base de datos
    └── migrations/         # Migraciones
```

**Razón de esta estructura:**
Implementé **Domain-Driven Design (DDD)** con **Clean Architecture** para mantener el código desacoplado y testeable:
- **Separación de responsabilidades**: Cada capa tiene una responsabilidad clara
- **Independencia de frameworks**: El dominio no conoce Prisma, Express ni ninguna tecnología específica
- **Testabilidad**: Fácil de mockear repositorios e inyectar dependencias
- **Mantenibilidad**: Cambios en infraestructura (ej: cambiar de Prisma a TypeORM) no afectan el dominio
- **Escalabilidad**: Estructura que crece bien cuando el proyecto se expande

### Estructura del Frontend

```
frontend/
├── src/
│   ├── features/           # Organización por features
│   │   ├── auth/          # Feature de autenticación
│   │   │   ├── context/   # AuthContext para estado global de auth
│   │   │   └── pages/     # LoginPage, RegisterPage
│   │   ├── dashboard/     # Feature de dashboard
│   │   ├── projects/      # Feature de proyectos
│   │   │   ├── components/ # Componentes específicos de proyectos
│   │   │   └── pages/     # ProjectsListPage, ProjectDetailPage
│   │   └── tasks/         # Feature de tareas
│   ├── layouts/           # Layouts compartidos (MainLayout)
│   ├── routes/            # Configuración de React Router
│   └── shared/            # Código compartido entre features
│       ├── components/    # Componentes reutilizables
│       ├── constants/     # Constantes (rutas, endpoints)
│       ├── hooks/         # Custom hooks
│       ├── services/      # Servicios API (authService, projectService)
│       ├── types/         # Tipos TypeScript compartidos
│       └── utils/         # Utilidades
```

**Razón de esta estructura:**
Organización **feature-based** (no por tipo de archivo) para mejor escalabilidad:
- **Cohesión**: Todo lo relacionado con una feature está junto
- **Encapsulamiento**: Cada feature es casi independiente
- **Shared**: Código compartido centralizado evita duplicación
- **Escalabilidad**: Fácil agregar nuevas features sin afectar las existentes
- **Developer Experience**: Más fácil encontrar archivos relacionados

---

## 🗄️ Diseño de Base de Datos

### Elección: MySQL

**Razones:**
- **Datos estructurados**: El proyecto maneja entidades con relaciones claras (Users, Projects, Tasks)
- **ACID**: Necesitamos transacciones confiables para operaciones como asignación de tareas/miembros
- **Familiaridad del equipo**: MySQL es ampliamente conocido, menor curva de aprendizaje
- **Herramientas maduras**: Excelente soporte de ORMs como Prisma
- **Escalabilidad**: Suficiente para el scope del proyecto, y escala bien verticalmente

### Schema/Modelos

**Tablas principales:**

1. **Person**: Información personal separada de la cuenta de usuario
   - `id`, `firstName`, `lastName`, `createdAt`, `updatedAt`, `deletedAt`

2. **User**: Cuenta de usuario (autenticación)
   - `id`, `email`, `username`, `password`, `personId`, `createdAt`, `updatedAt`, `deletedAt`
   - Relación 1:N con Person (un Person puede tener múltiples Users si se requiere en el futuro)

3. **Project**: Proyectos del sistema
   - `id`, `slug`, `name`, `description`, `createdById`, `createdAt`, `updatedAt`, `deletedAt`
   - Relación N:M con Users (miembros del proyecto)
   - Relación 1:N con Tasks

4. **Task**: Tareas dentro de proyectos
   - `id`, `name`, `description`, `status`, `priority`, `projectId`, `createdAt`, `updatedAt`, `deletedAt`
   - Enums: `TaskStatus` (pending, in_progress, reviewing, completed, archived)
   - Enums: `TaskPriority` (low, medium, high)
   - Relación N:M con Users (usuarios asignados)

**Decisiones importantes:**

- **Normalización**:
  - Separé `Person` y `User` para permitir múltiples cuentas por persona en el futuro
  - Enums para `TaskStatus` y `TaskPriority` en lugar de strings libres
  - Tablas intermedias implícitas para relaciones N:M (Prisma las maneja automáticamente)

- **Índices agregados**:
  - `email` y `username` en User (búsquedas frecuentes en autenticación)
  - `personId` en User (FK, joins frecuentes)
  - `createdById` en Project (filtrar por creador)
  - `projectId` en Task (FK, joins frecuentes)
  - `status` y `priority` en Task (filtrado y ordenamiento)
  - `deletedAt` en todas las tablas (soft deletes, filtrado)
  - `slug` en Project (UNIQUE, búsqueda por URL)

- **Relaciones**:
  - **1:N**: Person → User, Project → Task
  - **N:M**: User ↔ Project (miembros), User ↔ Task (asignados)
  - **Soft Deletes**: `deletedAt` en todas las entidades para auditoria
  - **Cascadas**: Definidas en Prisma para mantener integridad referencial

---

## 🔐 Seguridad

### Implementaciones de Seguridad

- [x] **Hash de contraseñas**: **bcrypt** con 10 salt rounds
  - **Por qué bcrypt**: Estándar de la industria, resistente a ataques de fuerza bruta, salt automático
  - **Salt rounds (10)**: Balance entre seguridad y performance (cada incremento duplica el tiempo)
  - Alternativa considerada: Argon2 (más moderno pero mayor complejidad de setup)

- [x] **JWT**: Tokens separados (access + refresh) con expiración configurable
  - **Access Token**: 15 minutos (configurable vía `JWT_ACCESS_EXPIRY`)
    - Corta duración minimiza riesgo si el token es comprometido
  - **Refresh Token**: 7 días (configurable vía `JWT_REFRESH_EXPIRY`)
    - Permite sesiones persistentes sin requerir login frecuente
  - **Secrets separados**: Access y Refresh usan secrets diferentes
  - **Payload mínimo**: Solo `userId` y `email` (no datos sensibles)

- [x] **Validación de inputs**: **Zod** en todos los endpoints
  - Validación en capa de presentación (antes de llegar a lógica de negocio)
  - Esquemas tipados y reutilizables (`loginSchema`, `registerSchema`, etc.)
  - Mensajes de error claros y específicos
  - Previene inyección SQL, XSS y otros ataques de entrada

- [x] **CORS**: Habilitado con configuración por environment variable
  - `CORS_ORIGIN` configurable (ej: `http://localhost:5173` para dev)
  - En producción se configuraría con el dominio específico
  - Previene requests no autorizados desde otros dominios

- [x] **Headers de seguridad**: **Helmet** para headers HTTP seguros
  - XSS Protection, Frameguard, HSTS, etc.
  - `X-Powered-By` deshabilitado (no exponer tecnología usada)
  - Configuración por defecto de Helmet (suficiente para scope del proyecto)

- [ ] **Rate limiting**: No implementado aún
  - Variables de configuración definidas en `.env.example` para futuro
  - `RATE_LIMIT_WINDOW_MS=900000` (15 min), `RATE_LIMIT_MAX_REQUESTS=100`

### Consideraciones Adicionales

**Medidas de seguridad implementadas:**
- **Passwords nunca retornados**: DTOs excluyen el campo `password` en respuestas
- **Soft Deletes**: Usuarios eliminados no pueden autenticarse (check en `GetCurrentUserUseCase`)
- **Error handling seguro**: No se exponen stack traces ni detalles internos en producción
- **Separación Person/User**: Datos personales separados de credenciales
- **Unique constraints**: Email y username únicos a nivel de base de datos

**Vulnerabilidades consideradas:**
- **SQL Injection**: Mitigado por Prisma (prepared statements automáticos)
- **XSS**: Mitigado por Helmet + React (escaping automático)
- **CSRF**: No implementado (stateless JWT, no cookies)
- **Brute Force**: Parcialmente mitigado por bcrypt (pendiente: rate limiting)
- **Token Theft**: Mitigado por expiración corta de access tokens

---

## 🎨 Decisiones de UI/UX

### Framework/Librería de UI

**Elegí**: Ant Design

**Razón**: Madurez comprobada en produccion, gran cantidad de componentes

### Patrones de Diseño

- **Responsive Design**: [¿Cómo lo abordaste? Mobile-first?]
- **Loading States**: [¿Cómo manejaste los estados de carga?]
- **Error Handling**: [¿Cómo muestras errores al usuario?]
- **Feedback Visual**: [Toasts, modales, etc.]

### Decisiones de UX

[Explica algunas decisiones importantes de experiencia de usuario que tomaste]

---

## 🧪 Testing

### Estrategia de Testing

**Backend:**
- **Tipo**: Tests de integración end-to-end (E2E)
- **Archivos de test**: 15 archivos cubriendo:
  - **Auth**: `login.test.ts`, `register.test.ts`, `me.test.ts`
  - **Projects**: `create.test.ts`, `update.test.ts`, `delete.test.ts`, `list.test.ts`, `getById.test.ts`, `addMember.test.ts`, `removeMember.test.ts`
  - **Tasks**: `create.test.ts`, `update.test.ts`, `delete.test.ts`, `list.test.ts`, `getById.test.ts`

- **Enfoque**: Tests de integración en lugar de unitarios
  - **Por qué integración**: Prueban el flujo completo (HTTP → Controller → UseCase → Repository → DB)
  - **Ventajas**: Mayor confianza, detectan problemas reales, cubren interacciones entre capas
  - **Trade-off**: Más lentos que tests unitarios, pero más valiosos para este proyecto

- **Herramientas**:
  - **Vitest**: Framework de testing (rápido, soporte TypeScript nativo)
  - **Supertest**: Testing de APIs HTTP
  - **Mocks**: Repositorios mockeados para aislar de base de datos real
  - **Test factories**: Helpers para crear datos de prueba consistentes

- **Casos probados**:
  - **Happy paths**: Flujos exitosos
  - **Validación**: Inputs inválidos (email mal formado, campos faltantes, etc.)
  - **Autenticación**: Tokens inválidos, usuarios no encontrados, cuentas eliminadas
  - **Business logic**: Email duplicado, username duplicado, permisos de proyectos

**Frontend:**
- **Tipo**: No implementados aún
- **Razón**: Priorización - con tiempo limitado, enfoqué esfuerzos en backend (core del negocio)
- **Plan futuro**: React Testing Library + Vitest para componentes críticos

### Cobertura

- **Backend**: ~85-90% (estimado)
  - Todos los endpoints críticos cubiertos
  - Casos edge cubiertos (usuarios eliminados, tokens expirados, etc.)
  - Múltiples escenarios por endpoint (happy path + errores)

- **Frontend**: 0%
  - Pendiente de implementar

**Justificación del nivel de cobertura:**
Con tiempo limitado, prioricé tests de integración en backend porque:
1. **Mayor ROI**: Backend tiene la lógica de negocio crítica (autenticación, autorización, validación)
2. **Confianza en despliegue**: Tests de integración dan confianza para hacer refactoring seguro
3. **Documentación viva**: Los tests documentan cómo usar cada endpoint
4. **Frontend menos crítico**: React maneja muchos edge cases automáticamente, y UI es más fácil de testear manualmente

---

## 🐳 Docker

### Implementación

- [ ] Dockerfile backend
- [ ] Dockerfile frontend
- [x] docker-compose.yml

**Decisiones:**
- He usado docker para montar el servidor de base de datos en mi ambiente local. No considero que para mi ambiente local tenga que "dockerizar" todas mis aplicaciones ya que conlleva mayor mantenimiento y consumo de recursos.
- Si el despliegue de mi aplicacion no sera en un docker/kubernetes no tiene sentido montar todo en docker. Lo unico que hace es crear una mayor brecha en mi ambiente local y produccion lo cual puede generar problemas en el futuro.
- Para esta app tengo pensado hacer el despliegue en ambiente serverless asi que no seria necesario mantener todo en docker.

---

## ⚡ Optimizaciones

### Backend

- [Optimización 1 y por qué la implementaste]
- [Optimización 2]
- [etc.]

### Frontend

- [Optimización 1]
- [Optimización 2]
- [etc.]

---

## 🚧 Desafíos y Soluciones

### Desafío 1: [Nombre del desafío]

**Problema:**
[Describe el problema que enfrentaste]

**Solución:**
[Cómo lo resolviste]

**Aprendizaje:**
[Qué aprendiste de esto]

### Desafío 2: [Nombre del desafío]

**Problema:**
[Descripción]

**Solución:**
[Tu solución]

**Aprendizaje:**
[Qué aprendiste]

### Desafío 3: [Nombre del desafío]

**Problema:**
[Descripción]

**Solución:**
[Tu solución]

**Aprendizaje:**
[Qué aprendiste]

---

## 🎯 Trade-offs

### Trade-off 1: Almacenamiento de credenciales de usuario

**Opciones consideradas:**
- Cognito: Al usar Cognito obtengo autenticacion usando email o sms pero tengo que implementar mas servicios para "escuchar" cuando un usuario ha sido autenticado, etc.
- Firebase Authentication: Similar a Cognito. Requiere un mayor despliegue de procesos y configuracion que tuve que dejar de lado debido al tiempo

**Elegí**: Guardar credenciales en la DB

**Razón:**
Para completar con el desarrollo de la solucion en el tiempo determinado. En el futuro se puede realizar una migracion de los usuarios a cualquier plataforma e implementar los servicios necesarios para la autenticacion.

### Trade-off 2: Uso del ORM

**Opciones consideradas:**
- Prisma
- Drizzle
- TypeORM

**Elegí**: Prisma

**Razón:**
- Una herramienta probada en ambientes empresariales, permite hacer queries mas facilmente. Drizzle es mas nueva. TypeORM es una opcion solida pero Prisma tiene una mayor documentacion y actualizaciones.

---

## 🔮 Mejoras Futuras

Si tuviera más tiempo, implementaría:

1. **Rate Limiting**
   - Descripción: Agregar un mecanismo para limitar el consumo del api en un determinado tiempo.
   - Beneficio: Previene consumos elevados de recursos
   - Tiempo estimado: 8 horas

2. **Mejora en la interfaz de tareas**
   - Descripción: Cambiar el diseño de la presentacion de las tareas por Cards en columnas simulando a Kanban
   - Beneficio: Mayor adaptabilidad para usuarios que vienen usando este tipo de interfaz durante mucho tiempo.
   - Tiempo estimado: 3 horas

3. **Despliegue en produccion automatico (CD)**
   - Descripción: Despliegue automatizado de la solucion cuando se aprueba y se fusiona un PR
   - Beneficio: Menores tiempos de despliegue, menos propenso al error
   - Tiempo estimado: 8 horas

4. **Modularizacion de componentes de React**
   - Descripcion: Por tema de tiempo no alcance a desglosar los componentes de react que tiene el frontend
   - Beneficio: Componentes mas limpios
   - Tiempo estimado: 2 horas

---

## 📚 Recursos Consultados

Lista de recursos que consultaste durante el desarrollo:

- ant.design
- prisma.io
- ts-rest.com
- vitest.dev

---

## 🤔 Reflexión Final

### ¿Qué salió bien?

[Reflexiona sobre qué aspectos del proyecto consideras que hiciste particularmente bien]

### ¿Qué mejorarías?

- Mejorar la UX de la interfaz para las tareas
- Implementar CI en el proyecto
- Subir el proyecto a AWS o Cloudflare
- Migrar el manejo de usuario y claves a otra herramienta como Cognito


### ¿Qué aprendiste?

- Generacion automatica de documentacion usando herramientas como TS-REST y TSOA

---

## 📸 Capturas de Pantalla

[Opcional: Agrega capturas de pantalla de tu aplicación]

### Login
![Login](./screenshots/login.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Lista de Proyectos
![Projects](./screenshots/projects.png)

### Detalle de Tareas
![Tasks](./screenshots/tasks.png)

---

**Fecha de última actualización**: 30/12/2025
