# Diagrama de Clases con los Microservicios

> **Stack:** Python · FastAPI · PostgreSQL · Docker  
> **Base:** SRS Caso 13 — Sistema de Gestión de Prácticas Laborales y Profesionales.

---

## Topología de Servicios

```mermaid
graph TD
    C(["Cliente\nBrowser / Móvil"])

    GW["API Gateway\n:8000\nRuteo · Verificación JWT · Rate-limit"]

    AUTH["auth-service\n:8001"]
    ACAD["academic-service\n:8002"]
    INTR["internship-service\n:8003"]
    EVAL["evaluation-service\n:8004"]
    DOCS["document-service\n:8005"]
    NOTIF["notification-service\n:8006"]

    DB1[("auth_db")]
    DB2[("academic_db")]
    DB3[("internship_db")]
    DB4[("evaluation_db")]
    DB5[("document_db")]
    DB6[("notification_db")]

    FS["File Storage\nVolumen Docker"]
    SMTP["SMTP Server"]

    C ==>|HTTPS| GW

    GW -->|"/auth/**"| AUTH
    GW -->|"/academic/**"| ACAD
    GW -->|"/internships/**"| INTR
    GW -->|"/evaluations/**"| EVAL
    GW -->|"/documents/**"| DOCS
    GW -->|"/notifications/**"| NOTIF

    AUTH --- DB1
    ACAD --- DB2
    INTR --- DB3
    EVAL --- DB4
    DOCS --- DB5
    NOTIF --- DB6
    DOCS --> FS
    NOTIF --> SMTP

    INTR -->|"GET /users/{id}"| AUTH
    INTR -->|"GET /careers/{id}"| ACAD
    EVAL -->|"GET /internships/{id}"| INTR
    DOCS -->|"GET /internships/{id}"| INTR
    NOTIF -->|"GET /users/{id}"| AUTH

    INTR -.->|"POST /notify"| NOTIF
    EVAL -.->|"POST /notify"| NOTIF
    DOCS -.->|"POST /notify"| NOTIF
```

> Las flechas sólidas representan dependencias directas (HTTP síncrono). Las flechas punteadas representan disparos de eventos hacia el servicio de notificaciones.

---

## Diagrama de Clases — Servicios y sus Operaciones

```mermaid
classDiagram
    class APIGateway {
        +validate_jwt(token) UserClaims
        +route(path, method) Response
        +forward_request(service, request) Response
    }

    class AuthService {
        +login(rut, password) Token
        +logout(token) void
        +refresh_token(token) Token
        +validate_token(token) UserClaims
        +create_user(data) User
        +update_user(id, data) User
        +deactivate_user(id) void
        +get_user(id) User
    }

    class AcademicService {
        +create_sede(data) Sede
        +update_sede(id, data) Sede
        +create_carrera(data) Carrera
        +update_carrera(id, data) Carrera
        +get_carrera(id) Carrera
        +create_centro(data) CentroPractica
        +update_centro(id, data) CentroPractica
        +search_centros(filters) list
    }

    class InternshipService {
        +create_practica(data) Practica
        +calcular_fecha_termino(inicio, tipo, carrera_id) date
        +update_estado(id, estado) Practica
        +asignar_docente(practica_id, docente_id) void
        +complete_acta1_alumno(id, data) Acta1
        +accept_acta1_docente(id) void
        +get_practica(id) Practica
        +list_practicas(filters) list
    }

    class EvaluationService {
        +create_eval_desempeno(data) EvaluacionDesempeno
        +create_eval_informe(data) EvaluacionInforme
        +calcular_nota(items, parametros) float
        +cerrar_evaluacion(id) void
        +generar_acta_final(practica_id) ActaFinal
        +validar_acta_final(id, docente_id) ActaFinal
        +get_parametros(carrera_id) ParametroEvaluacion
        +set_parametros(data) ParametroEvaluacion
    }

    class DocumentService {
        +upload(file, practica_id, tipo) Documento
        +download(id) FileStream
        +list_by_practica(practica_id) list
        +upload_material_apoyo(file, carrera_id) Documento
        +list_material_apoyo(carrera_id) list
        +validate_format(file) bool
    }

    class NotificationService {
        +send(user_id, tipo, context) void
        +send_manual_alert(coordinador_id, alumno_id, msg) AlertaManual
        +get_alert_history(alumno_id) list
        +check_expiring_deadlines() void
    }

    APIGateway ..> AuthService : valida JWT / rutea /auth
    APIGateway ..> AcademicService : rutea /academic
    APIGateway ..> InternshipService : rutea /internships
    APIGateway ..> EvaluationService : rutea /evaluations
    APIGateway ..> DocumentService : rutea /documents
    APIGateway ..> NotificationService : rutea /notifications

    InternshipService ..> AuthService : valida usuario y rol
    InternshipService ..> AcademicService : consulta carrera y centro
    InternshipService ..> NotificationService : notifica eventos de práctica
    EvaluationService ..> InternshipService : obtiene datos de práctica
    EvaluationService ..> NotificationService : notifica evaluación cerrada
    DocumentService ..> InternshipService : verifica práctica existente
    DocumentService ..> NotificationService : notifica carga de informe
    NotificationService ..> AuthService : obtiene email de usuario
```

---

## Diagrama de Clases — Modelos de Dominio por Servicio

```mermaid
classDiagram
    namespace auth_service {
        class User {
            +id : UUID
            +rut : str
            +nombre : str
            +apellido : str
            +email : str
            +password_hash : str
            +rol : RolEnum
            +carrera_id : UUID
            +is_active : bool
            +created_at : datetime
        }
        class RolEnum {
            <<enumeration>>
            SUPER_ADMIN
            JEFE_CARRERA
            COORDINADOR
            DOCENTE
            ALUMNO
            EMPLEADOR
        }
    }

    namespace academic_service {
        class Sede {
            +id : UUID
            +nombre : str
            +is_active : bool
        }
        class Carrera {
            +id : UUID
            +nombre : str
            +sede_id : UUID
            +horas_laboral : int
            +horas_profesional : int
            +is_active : bool
        }
        class CentroPractica {
            +id : UUID
            +nombre : str
            +giro : str
            +nombre_gerente : str
            +telefono : str
            +correo : str
            +nombre_contacto : str
            +correo_contacto : str
            +direccion : str
            +is_active : bool
        }
    }

    namespace internship_service {
        class Practica {
            +id : UUID
            +alumno_id : UUID
            +coordinador_id : UUID
            +docente_id : UUID
            +carrera_id : UUID
            +centro_practica_id : UUID
            +tipo : TipoPracticaEnum
            +estado : EstadoPracticaEnum
            +fecha_inicio : date
            +fecha_termino_calculada : date
            +fecha_termino_confirmada : date
            +created_at : datetime
        }
        class Acta1 {
            +id : UUID
            +practica_id : UUID
            +direccion_centro : str
            +departamento : str
            +nombre_jefe_directo : str
            +cargo_jefe_directo : str
            +contacto_correo : str
            +contacto_telefono : str
            +practica_a_distancia : bool
            +tareas_principales : str
            +foto_url : str
            +completada_alumno : bool
            +aceptada_docente : bool
            +fecha_limite_alumno : date
        }
        class TipoPracticaEnum {
            <<enumeration>>
            LABORAL
            PROFESIONAL
        }
        class EstadoPracticaEnum {
            <<enumeration>>
            PENDIENTE
            EN_CURSO
            FINALIZADA
            ANULADA
        }
    }

    namespace evaluation_service {
        class EvaluacionDesempeno {
            +id : UUID
            +practica_id : UUID
            +evaluador_id : UUID
            +tipo_evaluador : TipoEvaluadorEnum
            +items : JSON
            +nota : float
            +estado : EstadoEvalEnum
        }
        class EvaluacionInforme {
            +id : UUID
            +practica_id : UUID
            +docente_id : UUID
            +items : JSON
            +nota : float
            +estado : EstadoEvalEnum
        }
        class ActaFinal {
            +id : UUID
            +practica_id : UUID
            +nota_informe : float
            +nota_empleador : float
            +nota_final : float
            +validada_por : UUID
            +validada_en : datetime
        }
        class ParametroEvaluacion {
            +id : UUID
            +carrera_id : UUID
            +pct_informe : float
            +pct_empleador : float
        }
        class TipoEvaluadorEnum {
            <<enumeration>>
            DOCENTE
            EMPLEADOR
        }
        class EstadoEvalEnum {
            <<enumeration>>
            BORRADOR
            CERRADA
        }
    }

    namespace document_service {
        class Documento {
            +id : UUID
            +practica_id : UUID
            +nombre : str
            +tipo : TipoDocEnum
            +url : str
            +tamanio_kb : int
            +subido_por : UUID
            +created_at : datetime
        }
        class TipoDocEnum {
            <<enumeration>>
            INFORME_PRACTICA
            MATERIAL_APOYO
            ACTA_EVALUACION
        }
    }

    namespace notification_service {
        class Notificacion {
            +id : UUID
            +user_id : UUID
            +tipo : TipoNotifEnum
            +mensaje : str
            +enviada : bool
            +created_at : datetime
        }
        class AlertaManual {
            +id : UUID
            +coordinador_id : UUID
            +alumno_id : UUID
            +asunto : str
            +mensaje : str
            +created_at : datetime
        }
        class TipoNotifEnum {
            <<enumeration>>
            ACTA1_DISPONIBLE
            ACTA1_VENCE_MANANA
            DOCENTE_ASIGNADO
            INFORME_CARGADO
            PRACTICA_PROXIMA_VENCER
            EVALUACION_CERRADA
            PRACTICAS_SIN_CERRAR
        }
    }

    %% Relaciones internas auth_service
    User --> RolEnum : tiene

    %% Relaciones internas academic_service
    Sede "1" *-- "*" Carrera : contiene

    %% Relaciones internas internship_service
    Practica "1" *-- "1" Acta1 : compone
    Practica --> TipoPracticaEnum : clasifica
    Practica --> EstadoPracticaEnum : tiene estado

    %% Relaciones internas evaluation_service
    EvaluacionDesempeno --> TipoEvaluadorEnum : tipo
    EvaluacionDesempeno --> EstadoEvalEnum : estado
    EvaluacionInforme --> EstadoEvalEnum : estado
    ActaFinal "1" o-- "1" EvaluacionDesempeno : agrega nota
    ActaFinal "1" o-- "1" EvaluacionInforme : agrega nota
    ParametroEvaluacion ..> ActaFinal : aplica ponderación

    %% Relaciones internas document_service
    Documento --> TipoDocEnum : tipo

    %% Relaciones internas notification_service
    Notificacion --> TipoNotifEnum : tipo
```
