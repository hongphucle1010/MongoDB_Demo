import { Pool } from 'pg'

const postgreSqlClient = new Pool({
  host: 'localhost',
  user: 'hongphucle',
  password: '1010',
  database: 'seminar_database',
  port: 5432
})

export default postgreSqlClient
