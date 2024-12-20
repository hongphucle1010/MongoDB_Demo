/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongodb'
import { PEERS_COLLECTION, TORRENT_FILES_COLLECTION } from '../../lib/constant'
import mongoDb from '../../lib/mongoDbClient'

export async function createTorrentFileDemo() {
  return mongoDb.collection(TORRENT_FILES_COLLECTION).insertOne({
    _id: new ObjectId('111111111111111111111111'),
    name: 'torrentFileDemo',
    pieces: [
      {
        index: 0,
        hash: 'hashDemo1',
        size: 111
      },
      {
        index: 1,
        hash: 'hashDemo2',
        size: 111
      }
    ]
  })
}

export async function createPeerDemo() {
  return mongoDb.collection(PEERS_COLLECTION).insertOne({
    _id: new ObjectId('101010101010101010101010'),
    ip: '101.101.10.1',
    port: 1010,
    isOnline: true,
    download: 0,
    upload: 0,
    hashPieces: []
  })
}

export async function updateHashPiecesDemo() {
  return mongoDb
    .collection(PEERS_COLLECTION)
    .updateOne({ _id: new ObjectId('101010101010101010101010') }, { $set: { hashPieces: ['hashDemo1'] } })
}

export async function findPeersWithHashDemo() {
  return mongoDb.collection(PEERS_COLLECTION).find({ hashPieces: 'hashDemo1' }).toArray()
}

export async function getPiecesByTorrentIdDemo() {
  return mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .findOne({ _id: new ObjectId('111111111111111111111111') })
    .then((result) => result?.pieces)
}

export async function removeDemoData() {
  mongoDb.collection(PEERS_COLLECTION).deleteOne({ _id: new ObjectId('101010101010101010101010') })
  mongoDb.collection(TORRENT_FILES_COLLECTION).deleteOne({ _id: new ObjectId('111111111111111111111111') })
  return {}
}

export async function createTorrentWithLotsOfPieces() {
  const insertObject = {
    name: 'torrentFileDemo',
    pieces: Array.from({ length: 1000 }, (_, index) => ({
      index,
      hash: 'hashDemo' + index,
      size: 111
    }))
  }
  const startTime = process.hrtime()
  const response = await mongoDb.collection(TORRENT_FILES_COLLECTION).insertOne(insertObject)
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  return executionTime
}
