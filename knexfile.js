// Update with your config settings.

module.exports = {

    development: {
        client: 'sqlite3',
        connection: {
            filename: __dirname + '/dev.db'
        }
    },

    staging: {
        client: 'postgresql',
        connection: {
            host :    process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            user:     process.env.DB_USER,
            password: process.env.DB_PASS
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            host :    process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            user:     process.env.DB_USER,
            password: process.env.DB_PASS
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }

};