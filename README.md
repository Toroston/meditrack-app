# MediTrack

![CI](https://github.com/Joaquin1128/meditrack-app/actions/workflows/ci.yml/badge.svg)
![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Python](https://img.shields.io/badge/Python-3.10+-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Sistema de logística farmacéutica para la gestión integral de envíos, rutas y repartidores, con detección de fatiga en tiempo real mediante análisis acústico de voz por Inteligencia Artificial.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Detección de fatiga por voz (IA)](#detección-de-fatiga-por-voz-ia)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Funcionalidades](#funcionalidades)
- [Roles del sistema](#roles-del-sistema)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [CI/CD](#cicd)
- [Contribuir](#contribuir)

---

## Descripción general

MediTrack es una plataforma web orientada a la cadena logística farmacéutica. Permite gestionar envíos, asignar rutas optimizadas, hacer seguimiento público de pedidos y administrar la flota de transportes y repartidores. El sistema incorpora notificaciones en tiempo real vía WebSockets y generación de reportes en PDF y Excel.

La funcionalidad diferencial del sistema es la **validación de aptitud del repartidor mediante análisis acústico de voz con IA**, descrita en detalle en la sección siguiente.

---

## Detección de fatiga por voz (IA)

Antes de iniciar una ruta, el sistema solicita al repartidor grabar una frase preestablecida. El audio es enviado al microservicio de IA, que analiza las características acústicas de la voz y determina el nivel de fatiga del conductor.

### Modelo

El modelo está basado en **Wav2Vec2-XLS-R**, arquitectura de transformers preentrenada para procesamiento de audio de alta precisión, ajustada mediante fine-tuning sobre un dataset de voces en estados de alerta y fatiga extrema. La inferencia aplica calibración por temperatura (`T = 1.5`) para suavizar la distribución de probabilidades y evitar predicciones sobreconfiadas.

| Nivel de riesgo | Probabilidad de fatiga | Estado                       |
|-----------------|------------------------|------------------------------|
| BAJO            | < 30 %                 | Alerta activa                |
| MODERADO        | 30 % – 70 %            | Cansancio leve / monitoreo   |
| CRITICO         | > 70 %                 | Somnolencia extrema          |

En caso de riesgo **CRITICO**, el sistema bloquea automáticamente al repartidor e impide el inicio de la ruta hasta que un supervisor intervenga.

### Recursos del modelo

| Recurso | Enlace |
|---------|--------|
| Cuaderno de entrenamiento (Google Colab) | [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Joaquin1128/meditrack-app/blob/main/src/meditrack-ai/entrenamiento_fatiga.ipynb) |
| Modelo publicado en Hugging Face | [gabrieIsosa/modelo-fatiga-wav2vec](https://huggingface.co/gabrieIsosa/modelo-fatiga-wav2vec) |
| API del microservicio (Hugging Face Spaces) | [gabrieIsosa/meditrack-fatigue-api](https://huggingface.co/spaces/gabrieIsosa/meditrack-fatigue-api) |

### Endpoint de predicción

```
POST /predict
Content-Type: multipart/form-data

Parámetros:
  file  — archivo de audio (WAV, MP3, M4A, OGG, AAC, FLAC)

Respuesta:
{
  "success": true,
  "nivel_fatiga": 67.43,
  "nivel_alerta": 32.57,
  "riesgo": "MODERADO",
  "estado": "Cansancio Leve / Monitoreo"
}
```

### Componentes del microservicio

| Archivo | Descripción |
|---------|-------------|
| `src/meditrack-ai/entrenamiento_fatiga.ipynb` | Notebook completo: carga del dataset, fine-tuning y evaluación del modelo |
| `src/meditrack-ai/microservice/app.py` | API REST con FastAPI: recibe audio y retorna nivel de fatiga y riesgo |
| `src/meditrack-ai/microservice/Dockerfile` | Imagen Docker lista para despliegue |
| `src/meditrack-ai/microservice/requirements.txt` | Dependencias Python del microservicio |

---

## Arquitectura

```
┌─────────────────────┐      HTTP / WebSocket      ┌──────────────────────────┐
│   meditrack-front   │ ◄────────────────────────► │   meditrack-back         │
│   React 19 + Vite   │                             │   Spring Boot 3.2 / JPA  │
└─────────────────────┘                             └────────────┬─────────────┘
                                                                 │ HTTP
                                                    ┌────────────▼─────────────┐
                                                    │   meditrack-ai           │
                                                    │   FastAPI + Wav2Vec2     │
                                                    │   (Hugging Face Spaces)  │
                                                    └──────────────────────────┘
```

El frontend se comunica con el backend a través de una API REST y una conexión STOMP sobre WebSocket para notificaciones en tiempo real. El backend delega el análisis de audio al microservicio de IA alojado en Hugging Face Spaces.

---

## Tecnologías

### Frontend

| Tecnología | Versión |
|------------|---------|
| React | 19 |
| Vite | 8 |
| React Router | 7 |
| @react-google-maps/api | 2.x |
| STOMP.js + SockJS | — |
| Recharts | 3.x |
| Lucide React | — |

### Backend

| Tecnología | Versión |
|------------|---------|
| Java | 17 |
| Spring Boot | 3.2.5 |
| Spring Data JPA | — |
| Spring WebSocket | — |
| Spring Security Crypto | 6.2 |
| PostgreSQL | — |
| JWT (jjwt) | 0.12.3 |
| iTextPDF | 7.2.5 |
| Apache POI | 5.2.5 |
| Cloudinary | 1.36 |

### Microservicio IA

| Tecnología | Descripción |
|------------|-------------|
| FastAPI | Framework HTTP |
| Wav2Vec2-XLS-R | Modelo de audio (Hugging Face Transformers) |
| PyTorch | Inferencia |
| librosa | Procesamiento de señal de audio |

---

## Funcionalidades

- Gestión completa de envíos farmacéuticos
- Seguimiento público de pedidos por código de tracking
- Administración de clientes y medicamentos
- Creación y gestión de rutas con optimización por vecino más cercano (Haversine)
- Visualización de rutas en Google Maps
- Administración de transportes con control de carga volumétrica
- Gestión de repartidores con bloqueo automatico y manual
- Validación de aptitud por análisis acústico de voz (IA)
- Notificaciones y alertas en tiempo real via WebSockets
- Control de usuarios y roles con rutas protegidas
- Generación de reportes en PDF y Excel
- Gestión de imágenes via Cloudinary

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| Administrador | Acceso total al sistema |
| Supervisor | Gestión operativa y desbloqueo de repartidores |
| Operador | Alta y seguimiento de envíos |
| Repartidor | Ejecución de rutas, validación de aptitud |

---

## Estructura del repositorio

```
meditrack-app/
├── src/
│   ├── meditrack-front/          # Aplicación React
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       ├── context/
│   │       ├── services/
│   │       └── hooks/
│   ├── meditrack-back/           # API Spring Boot
│   │   └── src/main/java/
│   └── meditrack-ai/             # Modulo de IA
│       ├── entrenamiento_fatiga.ipynb
│       └── microservice/
│           ├── app.py
│           ├── Dockerfile
│           └── requirements.txt
├── docs/
├── tests/
├── .github/workflows/ci.yml
└── CONTRIBUTING.md
```

---

## Instalación y ejecución

### Prerrequisitos

- Node.js 20+
- Java 17+
- Maven (o usar el wrapper `mvnw` incluido)
- PostgreSQL
- Python 3.10+ (solo para ejecutar el microservicio localmente)

### Frontend

```bash
cd src/meditrack-front
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Backend

```bash
cd src/meditrack-back
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```

La API estará disponible en `http://localhost:8080`.

### Frontend + Backend simultaneamente

```bash
cd src/meditrack-front
npm install
npm run dev   # Levanta ambos con concurrently
```

### Microservicio IA (local)

```bash
cd src/meditrack-ai/microservice
pip install -r requirements.txt
python app.py
```

El microservicio estará disponible en `http://localhost:7860`. En produccion se consume desde Hugging Face Spaces.

---

## Variables de entorno

### Frontend — `src/meditrack-front/.env`

```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key
VITE_API_BASE_URL=http://localhost:8080
VITE_AI_API_URL=https://gabrieIsosa-meditrack-fatigue-api.hf.space
```

### Backend — `application.properties` o variables de entorno

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/meditrack
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=contraseña
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=86400000
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Microservicio IA — opcional

```env
MODEL_PATH=gabrieIsosa/modelo-fatiga-wav2vec   # por defecto
PORT=7860
```

---

## CI/CD

El repositorio incluye un pipeline de GitHub Actions (`.github/workflows/ci.yml`) que se ejecuta en cada push y pull request a `main`.

| Job | Pasos |
|-----|-------|
| Backend — Build & Test | Checkout, Java 17, `./mvnw clean verify` (JaCoCo coverage) |
| Frontend — Build & Lint | Checkout, Node 20, `npm ci`, `npm run lint`, `npm run build` |

Los secrets necesarios para el pipeline deben configurarse en **Settings > Secrets and variables > Actions** del repositorio.

---

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para la convención de commits, flujo de trabajo con branches y criterios para abrir un Pull Request.
