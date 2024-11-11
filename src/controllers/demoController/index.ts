import expressAsyncHandler from 'express-async-handler'
import mongoDb from '../../lib/mongoDbClient'
import { PEERS_COLLECTION, TORRENT_FILES_COLLECTION } from '../../lib/constant'
import {
  calculateSqlQueryTime,
  calculateSqlQueryTime2,
  calculateSqlQueryTime3,
  createPeerSql,
  createPiecePeerSql,
  createPieceSql,
  createTorrentFileSql,
  findPeersWithTorrentSql,
  findPiecesByTorrentIdSql,
  findPiecesByTorrentNameSql
} from '../../models/SQL'
import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import {
  calculateQueryTime,
  calculateQueryTime2,
  calculateQueryTime3,
  findPeersWithTorrentId,
  findPiecesByTorrentId,
  findPiecesByTorrentName
} from '../../models/Peer'

export const demoController = expressAsyncHandler(async (req, res, next) => {
  res.json({
    message: 'Hello World'
  })
})

interface Piece {
  index: number
  hash: string
  size: number
}

interface TorrentFile {
  name: string
  size: number
  pieces: Piece[]
}

interface Peer {
  ip: string
  port: number
  isOnline: boolean
  download: number
  upload: number
  hashPieces: string[]
}

interface TorrentSql {
  id: number
  name: string
  size: number
}

interface PieceSql {
  index: number
  hash: string
  size: number
  torrentId: number
}
interface PeerSql {
  id: number
  ip: string
  port: number
  isOnline: boolean
  download: number
  upload: number
}
interface PiecePeerSql {
  peerId: number
  hash: string
}

export const populateController = expressAsyncHandler(async (req, res, next) => {
  //   const numOfTorrentFiles = 100
  //   const numOfPeers = 20
  //   const numOfPieces = 20
  //   const numOfPiecesPerPeer = 100
  //   const minNumOfPiecesPerPeer = 10
  const numOfTorrentFiles = 10000
  const numOfPeers = 2000
  const numOfPieces = 20
  const numOfPiecesPerPeer = 1000
  const minNumOfPiecesPerPeer = 100

  const torrentFile: TorrentFile[] = []
  const torrentFileSql: TorrentSql[] = []
  const piecesSql: PieceSql[] = []
  for (let i = 0; i < numOfTorrentFiles; ++i) {
    const pieces: Piece[] = []
    for (let j = 0; j < numOfPieces; ++j) {
      const hashNum = i * numOfPieces + j
      pieces.push({
        index: j,
        hash: 'hash' + hashNum,
        size: 1024
      })
      piecesSql.push({
        index: j,
        hash: 'hash' + hashNum,
        size: 1024,
        torrentId: i
      })
    }
    // size of torrent file is 1024 * 10 - random number between 0 and 1024
    const random = Math.floor(Math.random() * 1024)
    torrentFile.push({
      name: 'name' + i,
      size: 1024 * 10 - random,
      pieces
    })

    torrentFileSql.push({
      id: i,
      name: 'name' + i,
      size: 1024 * 10 - random
    })

    mongoDb.collection(TORRENT_FILES_COLLECTION).insertOne(torrentFile[i])
    await createTorrentFileSql(torrentFileSql[i].id, torrentFileSql[i].name, torrentFileSql[i].size)
  }
  piecesSql.forEach(async (piece) => {
    await createPieceSql(piece.index, piece.size, piece.torrentId, piece.hash)
  })

  const peers: Peer[] = []
  const peersSql: PeerSql[] = []
  const piecePeersSql: PiecePeerSql[] = []
  for (let i = 0; i < numOfPeers; ++i) {
    const hashPieces: string[] = []
    const indexPieces = new Set()
    for (
      let j = 0;
      j < Math.floor(Math.random() * (numOfPiecesPerPeer - minNumOfPiecesPerPeer) + minNumOfPiecesPerPeer);
      ++j
    ) {
      indexPieces.add(Math.floor(Math.random() * numOfTorrentFiles * numOfPieces))
    }
    indexPieces.forEach((index) => {
      hashPieces.push('hash' + index)
      piecePeersSql.push({
        peerId: i,
        hash: 'hash' + index
      })
    })
    const randomPort = Math.floor(Math.random() * 65535)
    peers.push({
      ip: '192.168.1.' + i,
      port: randomPort,
      isOnline: true,
      download: 0,
      upload: 0,
      hashPieces
    })

    peersSql.push({
      id: i,
      ip: '192.168.1.' + i,
      port: randomPort,
      isOnline: true,
      download: 0,
      upload: 0
    })

    mongoDb.collection(PEERS_COLLECTION).insertOne(peers[i])
    createPeerSql(
      peersSql[i].id,
      peersSql[i].ip,
      peersSql[i].port,
      peersSql[i].isOnline,
      peersSql[i].download,
      peersSql[i].upload
    )
  }
  piecePeersSql.forEach(async (piecePeer) => {
    try {
      await createPiecePeerSql(piecePeer.peerId, piecePeer.hash)
    } catch (err) {
      console.error(err)
    }
  })
  res.json({
    message: 'Populate data successfully'
  })
})

export const getPeersByTorrentIdSqlController = expressAsyncHandler(async (req, res, next) => {
  const { torrentId } = req.params
  const rows = await findPeersWithTorrentSql(parseInt(torrentId))
  const { executionTimeDbSide, executionTime } = await calculateSqlQueryTime(parseInt(torrentId))
  res.json({ executionTimeDbSide, executionTime, result: rows })
})

export const findPeersWithTorrentIdController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const torrentId = new ObjectId(req.params.torrentId)
    const result = await findPeersWithTorrentId(torrentId)
    const executionTimeDbSide = await calculateQueryTime(torrentId)
    res.json({
      executionTimeDbSide,
      result
    })
  }
)

export const getPiecesByTorrentNameSqlController = expressAsyncHandler(async (req, res, next) => {
  const { name } = req.params
  const rows = await findPiecesByTorrentNameSql(name)
  const { executionTimeDbSide, executionTime } = await calculateSqlQueryTime2(name)
  res.json({ executionTimeDbSide, executionTime, result: rows })
})

export const getPiecesByTorrentNameController = expressAsyncHandler(async (req, res, next) => {
  const { name } = req.params
  const result = await findPiecesByTorrentName(name)
  const { executionTimeDbSide, executionTime } = await calculateQueryTime2(name)
  res.json({
    executionTimeDbSide,
    executionTime,
    result
  })
})

export const getPiecesByTorrentIdController = expressAsyncHandler(async (req, res, next) => {
  const { torrentId } = req.params
  const result = await findPiecesByTorrentId(new ObjectId(torrentId))
  const { executionTimeDbSide, executionTime } = await calculateQueryTime3(new ObjectId(torrentId))
  res.json({
    executionTimeDbSide,
    executionTime,
    result
  })
})

export const getPiecesByTorrentIdSqlController = expressAsyncHandler(async (req, res, next) => {
  const { torrentId } = req.params
  const rows = await findPiecesByTorrentIdSql(parseInt(torrentId))
  const { executionTimeDbSide, executionTime } = await calculateSqlQueryTime3(parseInt(torrentId))
  res.json({ executionTimeDbSide, executionTime, result: rows })
})
