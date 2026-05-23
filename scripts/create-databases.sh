#!/bin/bash
# Script ejecutado por el contenedor PostgreSQL en el primer arranque.
# Crea una base de datos separada por cada microservicio.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE academic_db;
    CREATE DATABASE internship_db;
    CREATE DATABASE evaluation_db;
    CREATE DATABASE document_db;
    CREATE DATABASE notification_db;
EOSQL

echo "Bases de datos creadas: auth_db, academic_db, internship_db, evaluation_db, document_db, notification_db"
