#!/usr/bin/env python3
"""
Seed de usuarios demo para el backend real.

Problema que resuelve:
  auth-service exige rol COORDINADOR o superior para crear usuarios
  (POST /api/v1/users), pero una base de datos nueva no tiene ningún
  usuario todavía -> nadie puede autenticarse para crear al primero
  ("chicken-and-egg").

Solución:
  auth-service confía en los headers X-User-Id / X-User-Role que en
  producción inyecta el API Gateway tras validar el JWT. Este script
  llama a auth-service DIRECTAMENTE (por su nombre de host Docker,
  dentro de la red `backend`), inyectando esos headers a mano con un
  rol SUPER_ADMIN "de arranque", igual que hace api-gateway/e2e_internal.py.

Cómo ejecutarlo (con los contenedores ya levantados):
  docker compose exec api-gateway python seed_demo_users.py

Los usuarios creados son los mismos 7 perfiles que usa el modo mock del
frontend (frontend/src/api/mockData.js), con la contraseña 'demo1234'
para todos, así el login real funciona igual que las demos del login.
"""

import sys

import httpx

AUTH = "http://auth-service:8000/api/v1"
BOOTSTRAP_HEADERS = {"X-User-Id": "seed-script", "X-User-Role": "SUPER_ADMIN"}
DEMO_PASSWORD = "demo1234"

# Mismo perfil de datos que frontend/src/api/mockData.js
DEMO_USERS = [
    {"rut": "12345678-9", "nombre": "Carmen", "apellido": "Silva",
     "email": "carmen.silva@usm.cl", "rol": "COORDINADOR"},
    {"rut": "20456789-2", "nombre": "Tomás", "apellido": "Rojas",
     "email": "tomas.rojas.2021@usm.cl", "rol": "ALUMNO"},
    {"rut": "18234567-K", "nombre": "Isabella", "apellido": "Morales",
     "email": "isabella.morales@usm.cl", "rol": "DOCENTE"},
    {"rut": "19876543-0", "nombre": "Roberto", "apellido": "Fuentes",
     "email": "roberto.fuentes@techsolutions.cl", "rol": "EMPLEADOR"},
    {"rut": "17654321-9", "nombre": "Andrés", "apellido": "Castillo",
     "email": "andres.castillo@usm.cl", "rol": "JEFE_CARRERA"},
    {"rut": "11111111-1", "nombre": "Super", "apellido": "Admin",
     "email": "admin@usm.cl", "rol": "SUPER_ADMIN"},
    {"rut": "20999888-7", "nombre": "Sofía", "apellido": "Vargas",
     "email": "sofia.vargas.2022@usm.cl", "rol": "ALUMNO"},
]


def main() -> int:
    client = httpx.Client(timeout=10.0, follow_redirects=True)
    created, skipped = 0, 0

    for u in DEMO_USERS:
        payload = {**u, "password": DEMO_PASSWORD}
        r = client.post(f"{AUTH}/users", json=payload, headers=BOOTSTRAP_HEADERS)
        if r.status_code == 201:
            print(f"✔ Creado {u['rol']:<12} rut={u['rut']}  ({u['email']})")
            created += 1
        elif r.status_code == 409:
            print(f"· Ya existía {u['rol']:<12} rut={u['rut']}")
            skipped += 1
        else:
            print(f"✘ Error creando {u['rut']}: {r.status_code} {r.text}")

    print(f"\nListo: {created} creado(s), {skipped} ya existían.")
    print(f"Contraseña para todos: {DEMO_PASSWORD}")
    print("Ejemplo de login: RUT 11111111-1 (SUPER_ADMIN) / demo1234")
    client.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
