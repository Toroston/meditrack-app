# Guía de contribución

Gracias por tu interés en contribuir a MediTrack. Este documento describe el flujo de trabajo, las convenciones y los criterios esperados para mantener la calidad y coherencia del proyecto.

---

## Requisitos previos

Antes de comenzar, asegurate de tener configurado el entorno según las instrucciones del [README](README.md).

---

## Flujo de trabajo

1. Crear un branch a partir de `main` con la siguiente convención de nombres:

   ```
   feat/nombre-descriptivo
   fix/nombre-descriptivo
   refactor/nombre-descriptivo
   docs/nombre-descriptivo
   ```

   Ejemplo:

   ```bash
   git checkout -b feat/validacion-aptitud-voz
   ```

2. Realizar los cambios en el branch correspondiente.

3. Commitear con mensajes claros y en minúscula siguiendo la convención de la sección siguiente.

4. Abrir un Pull Request hacia `main` con la descripción completa del cambio.

---

## Convención de commits

Usar prefijos semánticos en minúscula:

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un bug |
| `refactor:` | Cambio de código sin alterar comportamiento |
| `style:` | Cambios de formato, espaciado o nombrado sin lógica |
| `docs:` | Documentación únicamente |
| `test:` | Agregado o modificación de tests |
| `chore:` | Tareas de mantenimiento, dependencias, configuración |

Ejemplos:

```
feat: agregar validación de aptitud por análisis de voz
fix: corregir permisos en rutas protegidas del supervisor
refactor: simplificar lógica de asignación de transportes
docs: actualizar variables de entorno en README
```

El mensaje debe describir **qué** cambia, no **cómo**. Evitar mensajes genéricos como `fix bug` o `cambios`.

---

## Criterios para un Pull Request

El PR debe incluir:

- **Objetivo**: qué problema resuelve o qué funcionalidad agrega
- **Descripción del cambio**: qué fue modificado y por qué
- **Impacto**: si el cambio afecta otros módulos, roles o flujos existentes
- **Evidencia**: capturas de pantalla o logs si el cambio involucra UI o comportamiento visible

No se aprobará un PR que:

- Rompa los checks del pipeline de CI
- Modifique la lógica de roles o permisos sin descripción explícita del impacto
- Incluya código comentado, archivos de prueba locales o variables de entorno con valores reales

---

## Buenas practicas generales

- Mantener componentes y servicios con responsabilidad unica.
- No duplicar lógica que ya existe en otro modulo.
- Respetar el sistema de roles y rutas protegidas existente.
- Los nombres de componentes, variables y funciones deben ser descriptivos y en español o inglés de forma consistente dentro del mismo archivo.
- Probar el flujo completo afectado antes de abrir el PR.

---

## Pipeline de CI

Cada PR ejecuta automáticamente:

- **Backend**: `./mvnw clean verify` (build + tests + cobertura JaCoCo)
- **Frontend**: `npm run lint` + `npm run build`

Ambos checks deben pasar en verde antes de solicitar revisión.