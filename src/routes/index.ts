import express from 'express'
import { createTorrentFileController } from '../controllers/torrentFilesController'
export const routes = express.Router()

const torrentFilesRouter = express.Router()
const peersRouter = express.Router()

routes.use('/torrentFiles', torrentFilesRouter)
routes.use('/peers', peersRouter)

torrentFilesRouter.post('/', createTorrentFileController)
torrentFilesRouter.get('/:id', createTorrentFileController)
torrentFilesRouter.put('/:id', createTorrentFileController)
torrentFilesRouter.delete('/:id', createTorrentFileController)

peersRouter.post('/', createTorrentFileController)
peersRouter.get('/:id', createTorrentFileController)
peersRouter.put('/:id', createTorrentFileController)
peersRouter.delete('/:id', createTorrentFileController)
