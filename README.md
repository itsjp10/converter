# 🎙️ Audio-to-Text SaaS  

## 📌 Descripción  
Aplicación web que convierte audio en texto.  

- Los usuarios nuevos tienen **20 minutos gratuitos** de transcripción.  
- Luego se requiere **registro** y **compra de licencia** para continuar usando el servicio.  
- El sistema permite **subir audios**, transcribirlos y **descargar el texto** en distintos formatos (TXT, DOCX, PDF).  
- La aplicación sigue un modelo de **SaaS (Software as a Service)**.  

---

## 🏗️ Diseño de la Solución  

### **Arquitectura General**
- **Frontend & Backend unificados** → [Next.js](https://nextjs.org/) (App Router)  
- **Base de datos** → PostgreSQL en [Railway](https://railway.app/) (usando [Prisma](https://www.prisma.io/))  
- **Autenticación** → NextAuth.js con soporte para email/password y OAuth (Google, GitHub).  
- **Procesamiento de Audio** → API de terceros (ej: [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text), AssemblyAI o Deepgram).  
- **Pagos** → Stripe para gestionar licencias y facturación recurrente.  
- **Almacenamiento de audios** → S3-compatible (ej: AWS S3, Cloudflare R2 o Railway bucket).  

---

### **Modelos principales (Prisma)**  

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  passwordHash   String?
  creditsMinutes Int      @default(20) // minutos gratis al inicio
  subscription   Subscription?
  transcriptions Transcription[]
  createdAt      DateTime @default(now())
}

model Subscription {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  plan        String   // "basic", "pro", etc.
  status      String   // "active", "inactive"
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

model Transcription {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  audioUrl    String
  text        String?
  durationMin Int
  createdAt   DateTime @default(now())
}

## ✅ Checklist de implementación  

### 🔹 Infraestructura
- [ ] Crear proyecto en Next.js con TypeScript (`npx create-next-app@latest`)  
- [ ] Configurar Prisma y conectar a PostgreSQL en Railway  
- [ ] Crear modelos iniciales en `schema.prisma`  
- [ ] Ejecutar migraciones (`npx prisma migrate dev`)  

### 🔹 Autenticación y Usuarios
- [ ] Instalar y configurar NextAuth.js  
- [ ] Soporte para email/password + OAuth (Google/GitHub)  
- [ ] Middleware para proteger rutas `/dashboard` y `/transcribe`  
- [ ] Implementar control de minutos gratis (`creditsMinutes`)  

### 🔹 Gestión de Audio
- [ ] Integrar API de almacenamiento (ej: AWS S3 o Railway bucket)  
- [ ] Endpoint para subir audios (`/api/upload`)  
- [ ] Guardar metadata en DB (`duration`, `fileUrl`, `owner`)  

### 🔹 Transcripción
- [ ] Endpoint `/api/transcribe` que:  
  - Descargue el audio desde S3  
  - Llame a la API de transcripción (Whisper/AssemblyAI/Deepgram)  
  - Guarde resultado en `Transcription`  
  - Reste minutos a `creditsMinutes` del usuario  

### 🔹 Plan de Pagos
- [ ] Integrar Stripe Checkout y Webhooks  
- [ ] Crear tabla `Subscription` para registrar planes  
- [ ] Middleware que bloquee transcripciones si no hay créditos ni suscripción activa  

### 🔹 Frontend
- [ ] Página de registro/login  
- [ ] Dashboard con:  
  - Estado de minutos restantes  
  - Historial de transcripciones  
  - Botón "Subir audio y transcribir"  
- [ ] Página de pricing con Stripe Checkout  
- [ ] Página para ver transcripción y descargar en TXT, DOCX o PDF  

### 🔹 Monitoreo y Logs
- [ ] Configurar logging (ej: pino/winston)  
- [ ] Middleware para medir duración de llamadas a API  
- [ ] Alertas si API de transcripción falla  

---

## 🚀 Flujo de Usuario  

1. **Visita web** → Prueba gratis (20 min).  
2. **Sube audio** → Se procesa y transcribe.  
3. **Se agotan minutos** → Se le pide registro.  
4. **Compra plan** → Accede a minutos ilimitados según plan.  
5. **Descarga texto** en múltiples formatos.  

