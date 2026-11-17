# AI Ticket It

Plataforma de publicación de eventos y venta de entradas. Trabajo Práctico Individual de Desarrollo con IA, Cátedra Desarrollo de Software, UTN FRBA, 2C 2026.

- **Backend**: Node + Express 5 con persistencia en memoria.
- **Frontend**: React Native con Expo, corre en el celular con Expo Go.

## Estructura del monorepo

```
packages/
  backend/      API REST (Express)
  frontend/     App móvil (Expo + React Navigation)
```

Es un monorepo con npm workspaces: se instala todo con un único `npm install` en la raíz.

## Cómo correrlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Backend

```bash
cp packages/backend/.env.example packages/backend/.env   # una sola vez
npm run dev:backend
```

Al arrancar imprime las URLs disponibles, por ejemplo:

```
Backend escuchando en http://localhost:8000
  desde el celular: http://192.168.0.19:8000
  documentación:    http://localhost:8000/api-docs
```

El backend escucha en `0.0.0.0` para que el celular pueda conectarse desde la misma red Wi‑Fi. Si Windows pregunta, hay que permitir Node en redes privadas.

### 3. App móvil

```bash
npm run start:frontend
```

Escanear el QR con **Expo Go** (Android: desde la app; iOS: desde la cámara). El celular y la PC tienen que estar en la misma red.

La app detecta sola la IP de la PC (la misma que usa Metro) y apunta al puerto 8000. Si hace falta otra URL, se define en `packages/frontend/.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.0.19:8000
```

### 4. Tests y lint

```bash
npm test        # tests del backend (dominio + API con supertest)
npm run lint    # eslint en backend y frontend
```

## Usuarios y datos de prueba

No hay login: al abrir la app se elige con qué usuario operar y ese id viaja en el header `x-user-id`. Cualquier usuario puede comprar y también organizar eventos.

| Id | Usuario | Rol en los datos de ejemplo |
|---|---|---|
| 1 | Ana García | Organiza Noche de Rock Nacional, Final Liga de Básquet y Jazz en el Parque (pasado) |
| 2 | Martín López | Organiza Hamlet, Conferencia JS Argentina y Stand Up de Primavera (pasado) |
| 3 | Juan Pérez | Compras: Rock (confirmada, con chat), Hamlet (pendiente de pago), Jazz (utilizada y reseñada) |
| 4 | Lucía Fernández | Compras: Rock (reembolsada), Conferencia (confirmada), Jazz (utilizada y reseñada), Stand Up (utilizada, sin reseñar) |

Los datos se cargan en memoria al iniciar el backend (`src/data/datosIniciales.js`) y se pierden al reiniciarlo.

## Backend

### Arquitectura por capas

Cada request recorre:

```
ruta (src/routes)  →  middlewares (autenticar, validarSchema)  →  controller  →  service  →  dominio + repositorio  →  DTO
```

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Rutas | `src/routes/` | Un archivo por flujo (`comprasRoutes.js`, `eventosRoutes.js`, ...). Declaran paths, middlewares y documentación Swagger. `index.js` solo monta los prefijos. |
| Middlewares | `src/middlewares/` | `autenticar` (header `x-user-id`), `validarSchema` (Zod, deja los datos en `req.validado`), `registrarSolicitud` (log), `errores` (404 y traducción de errores a códigos HTTP). |
| Esquemas | `src/schemas/` | Esquemas Zod del body y la query de cada endpoint. Validan forma y tipos. |
| Controllers | `src/controllers/` | Leen `req`, llaman al service y responden con un DTO. Sin lógica de negocio. |
| Services | `src/services/` | Reglas de negocio: existencia, permisos, coordinación entre repositorios. |
| Dominio | `src/domain/` | Entidades del diagrama: `Evento`, `TipoEntrada`, `Compra` (máquina de estados), `Resenia`, `Mensaje`, `Usuario`, `Categoria`, `CambioEstadoCompra`, enum `EstadoCompra`. |
| Repositorios | `src/repositories/` | Persistencia en memoria (`InMemoryRepository` + consultas específicas). Async para poder cambiarlos por una base de datos. |
| DTOs | `src/dtos/` | Forma de las respuestas. Evitan exponer referencias circulares. |
| Errores | `src/errors/` | `ValidationError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409. |

`src/app.js` arma la aplicación inyectando dependencias (repositorios → services → controllers → rutas), lo que permite testearla con supertest sin levantar el servidor. `index.js` solo la escucha.

### Estados de una compra

```
PENDIENTE ──confirmar (comprador paga)──▶ CONFIRMADA ──utilizar (organizador)──▶ UTILIZADA ──▶ se puede reseñar
    │                                         │
    └── cancelar ──▶ CANCELADA                └── cancelar ──▶ CANCELADA ──▶ REEMBOLSADA
```

Cancelar repone el cupo. No se puede cancelar una compra utilizada ni una de un evento que ya se realizó. Cada cambio queda registrado en el historial con quién lo hizo y cuándo.

### Endpoints

Documentación interactiva en `http://localhost:8000/api-docs`. Los endpoints marcados con 🔒 requieren el header `x-user-id`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| GET | `/categorias` | Categorías de eventos |
| GET | `/usuarios` | Usuarios (para elegir cuál usar) |
| GET 🔒 | `/usuarios/:id/compras` | Mis compras, con estado y días para el evento |
| GET/POST 🔒 | `/usuarios/:id/favoritos` | Ver / agregar favoritos |
| DELETE 🔒 | `/usuarios/:id/favoritos/:eventoId` | Quitar favorito |
| GET | `/eventos?q=&categoria=&precioMin=&precioMax=&orden=&dir=` | Búsqueda textual, por categoría y orden por `precio`, `fecha` o `puntaje` |
| POST 🔒 | `/eventos` | Crear evento con tipos de entrada |
| GET | `/eventos/:id` | Detalle con tipos de entrada y reseñas del organizador |
| GET 🔒 | `/eventos/:id/compras` | Compras del evento y disponibilidad por tipo (solo organizador) |
| GET | `/organizadores/:id/eventos` | Eventos de un organizador |
| GET | `/organizadores/:id/resenias` | Reseñas y promedio de un organizador |
| POST 🔒 | `/compras` | Comprar entradas (queda PENDIENTE) |
| GET 🔒 | `/compras/:id` | Detalle e historial |
| POST 🔒 | `/compras/:id/confirmar` | Pagar (solo comprador) |
| POST 🔒 | `/compras/:id/utilizar` | Registrar ingreso (solo organizador) |
| POST 🔒 | `/compras/:id/cancelar` | Cancelar / reembolsar |
| GET/POST 🔒 | `/compras/:id/mensajes` | Chat de la compra |
| POST 🔒 | `/compras/:id/resenia` | Reseñar (solo compras utilizadas, una vez) |

Ejemplo:

```bash
curl -X POST http://localhost:8000/compras \
  -H "content-type: application/json" -H "x-user-id: 3" \
  -d '{"eventoId":1,"tipoEntradaId":1,"cantidad":2}'
```

## Frontend

```
packages/frontend/
  App.js                    Providers + NavigationContainer
  src/
    api/                    Cliente axios (baseURL + header x-user-id) y un módulo por recurso
    context/                UsuarioContext: usuario actual, persistido con AsyncStorage
    hooks/useCargar.js      Carga de datos al enfocar la pantalla, con recarga y manejo de error
    navigation/             Tabs (Explorar, Favoritos, Mis compras, Mis eventos, Perfil) y stacks
    screens/                Una pantalla por caso de uso
    components/             Botones, campos, tarjetas, badges de estado, chat, estrellas
    utils/                  Formato de precios/fechas y colores por estado
```

| Pantalla | Caso de uso |
|---|---|
| Explorar | Buscar por texto, filtrar por categoría, ordenar por precio, fecha o puntaje |
| Evento | Tipos de entrada con precio y cupo, puntaje y reseñas del organizador, favorito |
| Comprar | Elegir tipo y cantidad sin superar el cupo |
| Mis compras | Estado de cada compra y días que faltan si está confirmada |
| Compra | Pagar, cancelar (reembolso), marcar utilizada (organizador), reseñar, historial |
| Chat | Mensajes entre comprador y organizador |
| Reseñar | Puntaje 1 a 5 y comentario |
| Mis eventos / Nuevo evento | Crear eventos con varios tipos de entrada |
| Compras del evento | Compras con estado y cupo disponible por tipo |

## Flujo sugerido para la demo

1. Entrar como **Juan** (3). Explorar → Noche de Rock Nacional → Comprar 2 General → Pagar. La compra pasa a CONFIRMADA y muestra cuántos días faltan.
2. Abrir el chat y enviar una consulta.
3. Cambiar a **Ana** (1). Mis eventos → Noche de Rock → Ver compras: aparece la compra de Juan y el cupo actualizado. Responder el chat y marcar la entrada como utilizada.
4. Volver a **Juan**: la compra está UTILIZADA y permite dejar una reseña, que luego se ve en todos los eventos de Ana.
