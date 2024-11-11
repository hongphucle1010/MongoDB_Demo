import * as dotenv from 'dotenv'
dotenv.config()

export const MONGODB_URL = process.env.MONGODB_URL || ''
export const POSTGRES_URL = process.env.POSTGRES_URL || ''
export const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || ''
export const TORRENT_FILES_COLLECTION = process.env.TORRENT_FILES_COLLECTION || ''
export const PEERS_COLLECTION = process.env.PEERS_COLLECTION || ''
