import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  // connection: 'sqlite',
  connection: 'pg',

  connections: {
    /**
     * SQLite connection (default).
     */
    // sqlite: {
    //   client: 'better-sqlite3',

    //   connection: {
    //     filename: app.tmpPath('db.sqlite3'),
    //   },

    //   /**
    //    * Required by Knex for SQLite defaults.
    //    */
    //   useNullAsDefault: true,

    //   migrations: {
    //     /**
    //      * Sort migration files naturally by filename.
    //      */
    //     naturalSort: true,

    //     /**
    //      * Paths containing migration files.
    //      */
    //     paths: ['database/migrations'],
    //   },

    //   schemaGeneration: {
    //     /**
    //      * Enable schema generation from Lucid models.
    //      */
    //     enabled: true,

    //     /**
    //      * Custom schema rules file paths.
    //      */
    //     rulesPaths: ['./database/schema_rules.js'],
    //   },
    // },

    /**
     * PostgreSQL connection.
     * Install package to switch: npm install pg
     */
    pg: {
      client: 'pg',
      connection: {
        connectionString: env.get('DATABASE_URL'),

        /**
         * Ligado por `DATABASE_SSL`, e não por `NODE_ENV`: quem decide é onde o
         * banco está, não em que ambiente a aplicação roda. Banco na mesma rede
         * privada da aplicação costuma não falar TLS - e exigir TLS ali derruba
         * a conexão no boot.
         */
        ssl: (function () {
          if (env.get('DATABASE_SSL')) return { rejectUnauthorized: true }

          return false
        })(),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
