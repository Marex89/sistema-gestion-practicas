# ADR-010 — Límite del document-service

| Campo | Valor |
| :--- | :--- |
| **Estado** | Aceptado |
| **Fecha** | 2026-05-23 |
| **Contexto** | SRS Caso 13 — Sistema de Gestión de Prácticas |

---

## Decisión arquitectónica:
Crear un `document-service` dedicado para subida, validación y descarga de archivos.

### Alternativa A:
Guardar documentos dentro del `internship-service` o en carpetas locales por servicio.

### Descarte:
Se descarta porque duplicaría lógica de validación, almacenamiento y versionado de archivos. Además, acoplaría la gestión documental al ciclo de vida de la práctica.

### Alternativa B:
Crear un servicio documental independiente.

### Selección:
Se selecciona la alternativa B.

### Justificación:
Los documentos tienen reglas propias: formato, peso, almacenamiento y recuperación. Un servicio separado mantiene el dominio documental cohesivo y evita contaminar otros servicios con lógica de archivos.

---

## Impacto

- Aísla la persistencia de archivos.
- Facilita cambiar almacenamiento sin tocar el negocio.
- Reduce duplicación de validaciones de formato.
