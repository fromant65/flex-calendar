# Flex Calendar - Sistema de Gestión de Tareas Dinámico

Sistema de gestión de tareas con calendario integrado, construido con el [T3 Stack](https://create.t3.gg/).

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```powershell
npm install
```

### 2. Configurar Variables de Entorno

```powershell
# Copiar el archivo de ejemplo
Copy-Item .env.example .env

# Generar AUTH_SECRET
npm run auth:secret
```

Edita `.env` y pega el `AUTH_SECRET` generado.

### 3. Iniciar Base de Datos

```powershell
# Iniciar PostgreSQL con Docker
.\start-database.ps1

# O manualmente
docker-compose up -d
```

### 4. Ejecutar Migraciones

```powershell
# Generar migraciones
npm run db:generate

# Aplicar a la base de datos
npm run db:push
```

### 5. Iniciar Servidor de Desarrollo

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Características

### Backend API Completo

- ✅ **Autenticación**: Login con email/password usando NextAuth
- ✅ **Gestión de Tareas**: CRUD completo con importancia y urgencia
- ✅ **Recurrencias**: Tareas únicas, hábitos simples y hábitos+ (período)
- ✅ **Calendario**: Eventos fijos y móviles
- ✅ **Análisis**: Estadísticas de productividad
- ✅ **Tracking**: Seguimiento de tiempo estimado/real

### Sistema de Períodos (Hábitos+)

Tareas recurrentes con objetivos por período:
- "Ejercicio 3 veces por semana"
- "Meditar 5 veces al mes"
- Contador automático que se resetea cada período
- Flexibilidad temporal dentro del período

Ver [SISTEMA_PERIODOS.md](./SISTEMA_PERIODOS.md) para más detalles.

## 📚 Documentación

- **[API Documentation](./src/server/README.md)** - Documentación completa de la API
- **[Ejemplos de Uso](./EJEMPLOS_API.md)** - Ejemplos de código de la API
- **[Algoritmo de Urgencia](./ALGORITMO_URGENCIA.md)** - Cálculo de urgencia explicado
- **[Sistema de Períodos](./SISTEMA_PERIODOS.md)** - Hábitos+ con períodos
- **[Autenticación](./AUTENTICACION.md)** - Guía de autenticación
- **[Docker Database](./DOCKER_DATABASE.md)** - Configuración de PostgreSQL

## 🛠 Tecnologías

- **[Next.js 15](https://nextjs.org)** - Framework React
- **[tRPC 11](https://trpc.io)** - API TypeScript type-safe
- **[NextAuth 5](https://next-auth.js.org)** - Autenticación
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos
- **[Tailwind CSS](https://tailwindcss.com)** - Estilos
- **[Zod](https://zod.dev/)** - Validación de esquemas

## 📦 Scripts Disponibles

```powershell
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Verificar código con ESLint

npm run db:generate  # Generar migraciones de Drizzle
npm run db:push      # Aplicar migraciones a la base de datos
npm run db:studio    # Abrir Drizzle Studio (navegador de DB)

npm run auth:secret  # Generar AUTH_SECRET para NextAuth
```

## 🗄 Comandos de Base de Datos

```powershell
# Iniciar base de datos
.\start-database.ps1

# Ver logs
docker-compose logs -f

# Detener base de datos
docker-compose stop

# Eliminar contenedor (mantiene datos)
docker-compose down

# Eliminar TODO (¡incluye datos!)
docker-compose down -v
```

## 🔐 Autenticación

El sistema usa autenticación con credenciales (email/password).

### Registrar Usuario

```typescript
const user = await api.auth.register.mutate({
  name: "Juan Pérez",
  email: "juan@example.com",
  password: "password123",
});
```

### Login

```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "juan@example.com",
  password: "password123",
});
```

Ver [AUTENTICACION.md](./AUTENTICACION.md) y [EJEMPLO_AUTH.md](./EJEMPLO_AUTH.md) para más detalles.

## 📊 Arquitectura

```
src/
├── app/                    # Next.js App Router
├── server/
│   ├── api/
│   │   ├── routers/       # tRPC routers (endpoints)
│   │   ├── services/      # Lógica de negocio
│   │   ├── adapter/       # Adaptadores repo-service
│   │   └── repository/    # Acceso a datos
│   ├── auth/              # Configuración de NextAuth
│   └── db/                # Esquemas de Drizzle
├── trpc/                  # Cliente tRPC
└── styles/                # Estilos globales
```

**Flujo de datos:**
```
Cliente → tRPC Router → Service → Adapter → Repository → Database
```

## 🎯 Endpoints de API

### Autenticación (`api.auth`)
- `register` - Registrar usuario
- `changePassword` - Cambiar contraseña

### Tareas (`api.task`)
- `create` - Crear tarea
- `update` - Actualizar tarea
- `delete` - Eliminar tarea
- `list` - Listar tareas
- `getById` - Obtener por ID
- `getByImportance` - Filtrar por importancia
- `getMostUrgent` - Tareas más urgentes
- `complete` - Completar tarea
- `postpone` - Postponer tarea
- `estimateTime` - Estimar tiempo

### Ocurrencias (`api.occurrence`)
- `list` - Listar ocurrencias
- `getById` - Obtener por ID
- `complete` - Completar ocurrencia
- `skip` - Saltar ocurrencia
- `reschedule` - Reprogramar
- `logTime` - Registrar tiempo
- `getUpcoming` - Próximas ocurrencias
- `getOverdue` - Vencidas

### Eventos de Calendario (`api.calendarEvent`)
- `create` - Crear evento
- `update` - Actualizar evento
- `delete` - Eliminar evento
- `list` - Listar eventos
- `getById` - Obtener por ID
- `getByDateRange` - Eventos en rango
- `reschedule` - Reprogramar
- `complete` - Completar
- `getUpcoming` - Próximos eventos

## 🌟 Ejemplos de Uso

### Crear Tarea con Recurrencia Periódica

```typescript
const task = await api.task.create.mutate({
  name: "Hacer ejercicio",
  importance: 9,
  recurrence: {
    interval: 7,           // Período de 7 días (semana)
    maxOccurrences: 3,     // 3 veces por semana
  },
});
```

### Obtener Tareas Más Urgentes

```typescript
const urgentTasks = await api.task.getMostUrgent.query({ limit: 5 });
```

### Completar Ocurrencia y Crear Siguiente

```typescript
await api.occurrence.complete.mutate({
  occurrenceId: 123,
  actualTimeSpent: 45, // minutos
});
// Automáticamente crea la siguiente ocurrencia
```

Ver más ejemplos en [EJEMPLOS_API.md](./EJEMPLOS_API.md).

## 🚀 Despliegue

### Vercel (Recomendado)

1. Haz push a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura variables de entorno:
   - `AUTH_SECRET`
   - `DATABASE_URL` (usa un servicio como Neon, Supabase, o Railway)
4. Deploy automático

### Docker

```powershell
docker build -t flex-calendar .
docker run -p 3000:3000 flex-calendar
```

## 🤝 Contribuir

Este es un proyecto personal, pero sugerencias y feedback son bienvenidos.

## 📝 Licencia

MIT

---

Desarrollado con ❤️ usando el [T3 Stack](https://create.t3.gg/)
