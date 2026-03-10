// cms/config/database.js
// SQLite fuer lokale Entwicklung, PostgreSQL auf Strapi Cloud (automatisch)
'use strict'

const path = require('path')

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite')

  const connections = {
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: {
        host:     env('DATABASE_HOST', '127.0.0.1'),
        port:     env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'kopfsachen'),
        user:     env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', ''),
        ssl:      env.bool('DATABASE_SSL', false),
      },
    },
  }

  return { connection: { client, ...connections[client] } }
}
