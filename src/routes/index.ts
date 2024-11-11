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
  findAvailablePeersController,
  readPeerByIdController,
  updatePeerController
} from '../controllers/peerController'
import {
  findPeersWithTorrentIdController,
  getPeersByTorrentIdSqlController,
  getPiecesByTorrentIdController,
  getPiecesByTorrentIdSqlController,
  getPiecesByTorrentNameController,
  getPiecesByTorrentNameSqlController,
  populateController
} from '../controllers/demoController'
import {
  createPeerDemo,
  createTorrentFileDemo,
  createTorrentWithLotsOfPieces,
  findPeersWithHashDemo,
  getPiecesByTorrentIdDemo,
  removeDemoData,
  updateHashPiecesDemo
} from '../models/Demo'
import { clearTorrentFileWithLotsOfPiecesSql, createTorrentWithLotsOfPiecesSql } from '../models/SQL'
// import { initController } from '../controllers/sqlController'
export const routes = express.Router()

const torrentFilesRouter = express.Router()
const peersRouter = express.Router()
const sqlRouter = express.Router()
const demoRouter = express.Router()
const demo2Router = express.Router()
const demo3Router = express.Router()
const demo4Router = express.Router()
const demoFinalRouter = express.Router()

routes.use('/torrentFiles', torrentFilesRouter)
routes.use('/peers', peersRouter)
routes.use('/sql', sqlRouter)

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
routes.use('/find-available-peers/:torrentId', findAvailablePeersController)
// routes.use('/init', initController)
routes.use('/demo', demoRouter)
demoRouter.use('/populate', populateController)
demoRouter.use('/find/:torrentId', getPeersByTorrentIdSqlController)
demoRouter.use('/findmongo/:torrentId', findPeersWithTorrentIdController)

routes.use('/demo2', demo2Router)
demo2Router.use('/find/:name', getPiecesByTorrentNameSqlController)
demo2Router.use('/findmongo/:name', getPiecesByTorrentNameController)

routes.use('/demo3', demo3Router)
demo3Router.use('/find/:torrentId', getPiecesByTorrentIdSqlController)
demo3Router.use('/findmongo/:torrentId', getPiecesByTorrentIdController)

routes.use('/demo-final', demoFinalRouter)
demoFinalRouter.use('/run', runDemoController)
async function runDemoController(req: express.Request, res: express.Response) {
  const response = await removeDemoData()
  res.json(response)
}
demoFinalRouter.use('/compare', compareDemoController)
async function compareDemoController(req: express.Request, res: express.Response) {
  const mongoDbResult = await createTorrentWithLotsOfPieces()
  await clearTorrentFileWithLotsOfPiecesSql()
  const sqlResult = await createTorrentWithLotsOfPiecesSql()

  res.json({ mongoDbResult, sqlResult })
}
