#!/usr/bin/env python3
"""
Script E2E interno para ejecutarse dentro del contenedor `api-gateway`.
Hace llamadas internas a los servicios por su nombre de host Docker: auth-service, academic-service, internship-service, evaluation-service, document-service, notification-service.

Nota: este script asume que los endpoints básicos existen y responden según la especificación mínima.
"""

import sys
import time
import json
import httpx

# URLs internas (desde dentro de la red Docker)
AUTH = "http://auth-service:8000/api/v1"
ACAD = "http://academic-service:8000/api/v1"
INTR = "http://internship-service:8000/api/v1"
EVAL = "http://evaluation-service:8000/api/v1"
DOCS = "http://document-service:8000/api/v1"
NOTIF = "http://notification-service:8000/api/v1"

client = httpx.Client(timeout=10.0, follow_redirects=True)

def pretty(r):
    try:
        return json.dumps(r.json(), indent=2, ensure_ascii=False)
    except Exception:
        return r.text


def safe_post(url, json=None, data=None, headers=None, files=None):
    try:
        r = client.post(url, json=json, data=data, headers=headers, files=files)
        print(f"POST {url} -> {r.status_code}")
        print(pretty(r))
        return r
    except Exception as e:
        print(f"ERROR POST {url}: {e}")
        raise


def safe_get(url, headers=None):
    try:
        r = client.get(url, headers=headers)
        print(f"GET {url} -> {r.status_code}")
        print(pretty(r))
        return r
    except Exception as e:
        print(f"ERROR GET {url}: {e}")
        raise


def main():
    # 1) Crear usuarios de prueba
    users = [
        ("11111111-1", "Super", "Admin", "admin@example.com", "adminpass", "SUPER_ADMIN"),
        ("22222222-2", "Coord", "Uno", "coord@example.com", "coordpass", "COORDINADOR"),
        ("33333333-3", "Docente", "Uno", "docente@example.com", "docpass", "DOCENTE"),
        ("44444444-4", "Alumno", "Uno", "alumno@example.com", "alumnopass", "ALUMNO"),
        ("55555555-5", "Empleador", "Uno", "empleador@example.com", "empass", "EMPLEADOR"),
    ]

    ids = {}

    for rut, nombre, apellido, email, password, rol in users:
        payload = {
            "rut": rut,
            "nombre": nombre,
            "apellido": apellido,
            "email": email,
            "password": password,
            "rol": rol,
        }
        r = safe_post(f"{AUTH}/users", json=payload, headers={"X-User-Id": "system", "X-User-Role": "SUPER_ADMIN"})
        if r.status_code in (200,201):
            try:
                ids[rol] = r.json().get("id") or r.json().get("user_id")
            except Exception:
                ids[rol] = None
        else:
            print(f"Advertencia: creación usuario {rol} respondió {r.status_code}")

    # 2) Login con SUPER_ADMIN
    r = safe_post(f"{AUTH}/auth/login", data={"username": "11111111-1", "password": "adminpass"})
    if r.status_code != 200:
        print("ERROR: no se pudo autenticar como SUPER_ADMIN. Abortando.")
        sys.exit(10)
    token = r.json().get("access_token")
    # Obtener tokens y headers para cada rol que se usará en el flujo E2E
    roles_creds = {
        "SUPER_ADMIN": ("11111111-1", "adminpass"),
        "COORDINADOR": ("22222222-2", "coordpass"),
        "DOCENTE": ("33333333-3", "docpass"),
        "ALUMNO": ("44444444-4", "alumnopass"),
        "EMPLEADOR": ("55555555-5", "empass"),
    }
    role_headers: dict = {}
    import base64
    for role, (username, password) in roles_creds.items():
        rr = safe_post(f"{AUTH}/auth/login", data={"username": username, "password": password})
        if rr.status_code == 200:
            tk = rr.json().get("access_token")
            try:
                payload_part = tk.split(".")[1]
                padding = "=" * (-len(payload_part) % 4)
                decoded_payload = json.loads(base64.urlsafe_b64decode(payload_part + padding))
                uid = decoded_payload.get("sub")
                role_from_token = decoded_payload.get("role")
            except Exception:
                uid = None
                role_from_token = role
            role_headers[role] = {"Authorization": f"Bearer {tk}", "X-User-Id": uid, "X-User-Role": role_from_token or role}
        else:
            role_headers[role] = None

    # 3) Crear Sede
    r = safe_post(f"{ACAD}/academic/sedes", json={"nombre": "Sede Central"}, headers=role_headers.get("COORDINADOR"))
    sede_id = r.json().get("id") if r.status_code in (200,201) else None

    # 4) Crear Carrera
    carrera_payload = {
        "nombre": "Ingenieria Ejemplo",
        "sede_id": sede_id,
        "horas_laboral": 240,
        "horas_profesional": 360,
    }
    r = safe_post(f"{ACAD}/academic/carreras", json=carrera_payload, headers=role_headers.get("COORDINADOR"))
    carrera_id = r.json().get("id") if r.status_code in (200,201) else None

    # 5) Crear Centro Practica
    centro_payload = {
        "nombre": "Empresa Demo",
        "giro": "IT",
        "nombre_gerente": "Gerente Demo",
        "telefono": "+56900000000",
        "correo": "contacto@empresa.demo",
        "nombre_contacto": "Jefe Area",
        "correo_contacto": "jefe@empresa.demo",
        "direccion": "Calle Falsa 123",
    }
    r = safe_post(f"{ACAD}/academic/centros", json=centro_payload, headers=role_headers.get("COORDINADOR"))
    centro_id = r.json().get("id") if r.status_code in (200,201) else None

    # 6) Registrar Practica
    practica_payload = {
        "alumno_id": role_headers.get("ALUMNO", {}).get("X-User-Id"),
        "coordinador_id": role_headers.get("COORDINADOR", {}).get("X-User-Id"),
        "docente_id": role_headers.get("DOCENTE", {}).get("X-User-Id"),
        "carrera_id": carrera_id,
        "centro_practica_id": centro_id,
        "tipo": "LABORAL",
        "fecha_inicio": "2026-06-01",
    }
    r = safe_post(f"{INTR}/internships", json=practica_payload, headers=role_headers.get("COORDINADOR"))
    practica_id = r.json().get("id") if r.status_code in (200,201) else None

    # 7) Asignar docente a la práctica (COORDINADOR)
    if practica_id:
        docente_id = role_headers.get("DOCENTE", {}).get("X-User-Id")
        if docente_id:
            r = client.patch(
                f"{INTR}/internships/{practica_id}/docente",
                json={"docente_id": docente_id},
                headers=role_headers.get("COORDINADOR"),
            )
            print(f"PATCH asignar docente -> {r.status_code}")
            print(pretty(r))

    # 8) Alumno completa Acta1 (si endpoint existe)
    acta_payload = {
        "direccion_centro": "Calle Falsa 123",
        "departamento": "IT",
        "nombre_jefe_directo": "Jefe Area",
        "cargo_jefe_directo": "Supervisor",
        "contacto_correo": "jefe@empresa.demo",
        "contacto_telefono": "+56900000000",
        "practica_a_distancia": False,
        "tareas_principales": "Desarrollo de software",
    }
    if practica_id:
        r = client.patch(f"{INTR}/internships/{practica_id}/acta1", json=acta_payload, headers=role_headers.get("ALUMNO"))
        print(f"PATCH acta1 -> {r.status_code}")
        print(pretty(r))

    # 9) Docente acepta Acta1
    if practica_id:
        r = client.post(f"{INTR}/internships/{practica_id}/acta1/accept", headers=role_headers.get("DOCENTE"))
        print(f"POST accept acta1 -> {r.status_code}")
        print(pretty(r))

    # 10) Subir documento (archivo de texto pequeño)
    if practica_id:
        files = {"file": ("informe.pdf", b"%PDF-1.4\n%Test PDF\n", "application/pdf")}
        data = {"tipo": "INFORME"}
        if practica_id:
            data["practica_id"] = practica_id
        r = client.post(f"{DOCS}/documents/upload", files=files, data=data, headers=role_headers.get("ALUMNO"))
        print(f"UPLOAD documento -> {r.status_code}")
        print(pretty(r))

    # 10) Empleador evalua (simulado)
    eval_emp = {
        "practica_id": practica_id,
        "evaluador_id": role_headers.get("EMPLEADOR", {}).get("X-User-Id"),
        "tipo_evaluador": "EMPLEADOR",
        "items": [{"criterio": "Responsabilidad", "puntaje_obtenido": 5, "puntaje_max": 7}],
    }
    r = safe_post(f"{EVAL}/evaluations/desempeno", json=eval_emp, headers=role_headers.get("EMPLEADOR"))
    eval_emp_id = r.json().get("id") if r.status_code in (200,201) else None
    # Cerrar evaluación de empleador (si se creó)
    if eval_emp_id:
        safe_post(f"{EVAL}/evaluations/desempeno/{eval_emp_id}/cerrar", headers=role_headers.get("EMPLEADOR"))

    # 11) Docente evalua informe
    eval_doc = {
        "practica_id": practica_id,
        "docente_id": role_headers.get("DOCENTE", {}).get("X-User-Id"),
        "items": [{"criterio": "Calidad Informe", "puntaje_obtenido": 6, "puntaje_max": 7}],
    }
    r = safe_post(f"{EVAL}/evaluations/informe", json=eval_doc, headers=role_headers.get("DOCENTE"))
    eval_doc_id = r.json().get("id") if r.status_code in (200,201) else None
    if eval_doc_id:
        safe_post(f"{EVAL}/evaluations/informe/{eval_doc_id}/cerrar", headers=role_headers.get("DOCENTE"))

    # 12) Obtener ActaFinal
    if practica_id:
        r = safe_get(f"{EVAL}/evaluations/acta-final/{practica_id}", headers=role_headers.get("COORDINADOR"))

    # 13) Comprobar notificaciones
    alumno_id = role_headers.get("ALUMNO", {}).get("X-User-Id")
    if alumno_id:
        r = safe_get(f"{NOTIF}/notifications/history/{alumno_id}", headers=role_headers.get("COORDINADOR"))

    print("E2E interno finalizado (ver salidas para detalles).")


if __name__ == "__main__":
    try:
        main()
    finally:
        client.close()
