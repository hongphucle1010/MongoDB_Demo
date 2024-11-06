import express from 'express'
import {
  announceTorrentController,
  createTorrentFileController,
  deleteTorrentFileController,
  readTorrentFileByIdController,
  updateTorrentFileController,
  uploadTorrentController
} from '../controllers/torrentFilesController'
import {
  createPeerController,
  deletePeerController,
  readPeerByIdController,
  updatePeerController
} from '../controllers/peerComtroleer'
export const routes = express.Router()

const torrentFilesRouter = express.Router()
const peersRouter = express.Router()

routes.use('/torrentFiles', torrentFilesRouter)
routes.use('/peers', peersRouter)

torrentFilesRouter.post('/', createTorrentFileController)
torrentFilesRouter.get('/:id', readTorrentFileByIdController)
torrentFilesRouter.put('/:id', updateTorrentFileController)
torrentFilesRouter.delete('/:id', deleteTorrentFileController)

peersRouter.post('/', createPeerController)
peersRouter.get('/:id', readPeerByIdController)
peersRouter.put('/:id', updatePeerController)
peersRouter.delete('/:id', deletePeerController)

routes.use('/upload-torrent', uploadTorrentController)
routes.use('/announce', announceTorrentController)
