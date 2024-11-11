import { Db, MongoClient } from 'mongodb'
import { MONGODB_DATABASE_NAME, MONGODB_URL } from './constant'

const mongoDbClient = new MongoClient(MONGODB_URL)
const mongoDb: Db = mongoDbClient.db(MONGODB_DATABASE_NAME)

export async function connectToDatabase() {
  await mongoDbClient.connect()
  console.log('Connected to MongoDB Atlas')
}

export default mongoDb

