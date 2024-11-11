import expressAsyncHandler from 'express-async-handler'
import { createTorrentFileSql, initSql } from '../../models/SQL'

export const initController = expressAsyncHandler(async (req, res, next) => {
  await initSql()
  res.json({ message: 'SQL tables created' })
})

export const createTorentFileSqlController = expressAsyncHandler(async (req, res, next) => {
  const { name, size } = req.body
  await createTorrentFileSql(name, size)
  res.json({ message: 'Torrent file created' })
})

export const readTorrentFileByIdSqlController = expressAsyncHandler(async (req, res, next) => {
    
})
