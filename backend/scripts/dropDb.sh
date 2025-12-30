#!/bin/bash

CONTAINER_NAME="project_management_mysql"
DB_NAME="${DATABASE_NAME:-project_management}"
DB_USER="${DATABASE_USER:-jelou}"
DB_PASSWORD="${DATABASE_PASSWORD:-jelou}"

docker exec -i "${CONTAINER_NAME}" mysql -u"${DB_USER}" -p"${DB_PASSWORD}" <<-EOSQL
    DROP DATABASE IF EXISTS \`${DB_NAME}\`;
    CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOSQL