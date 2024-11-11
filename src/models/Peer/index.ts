/* 
TorrentFile schema:
{
    _id: ObjectId,     // Unique identifier for the torrent file
    name: String,      // Name of the torrent file
    size: Number,      // Total size of the file in bytes
    pieces: [          // Array of pieces associated with the torrent
        {
            index: Number,        // Index of the piece
            size: Number,         // Size of the piece
            hash: String,         // Hash for data integrity check
            peerIds: [ObjectId]   // Array of references to peers that have this piece
        }
    ]
}

Peer schema:
{
    _id: ObjectId,     // Unique identifier for the peer
    ip: String,        // IP address of the peer
    port: Number,      // Port number used by the peer
    isOnline: Boolean, // Online status of the peer
    download: Number,  // Total data downloaded by the peer (in bytes)
    upload: Number,    // Total data uploaded by the peer (in bytes)
}
*/

import { ObjectId } from 'mongodb'
import { PEERS_COLLECTION, TORRENT_FILES_COLLECTION } from '../../lib/constant'
import mongoDb from '../../lib/mongoDbClient'

// CRUD operations for Peer model
export async function createPeer(peer: Peer) {
  return mongoDb.collection(PEERS_COLLECTION).insertOne(peer)
}

export async function readPeerById(peerId: ObjectId) {
  return mongoDb.collection(PEERS_COLLECTION).findOne({ _id: peerId })
}

export async function updatePeer(peerId: ObjectId, updatedPeer: Partial<Peer>) {
  return mongoDb.collection(PEERS_COLLECTION).updateOne({ _id: peerId }, { $set: updatedPeer })
}

export async function deletePeer(peerId: ObjectId) {
  return mongoDb.collection(PEERS_COLLECTION).deleteOne({ _id: peerId })
}

export async function upsertPeer(peerData: Peer) {
  const { pieces, ...peerFields } = peerData // Separate pieces from the rest of the fields

  return mongoDb.collection(PEERS_COLLECTION).updateOne(
    { _id: peerData._id },
    {
      $set: peerFields, // Set all other peer data fields
      $addToSet: { pieces: { $each: pieces } } // Add only unique pieces
    },
    { upsert: true }
  )
}

export async function findAvailablePeers(torrentId: ObjectId) {
  return mongoDb
    .collection(PEERS_COLLECTION)
    .find({ torrentId })
    .project({ ip: 1, port: 1, pieces: 1 }) // Only include relevant fields
    .toArray()
}
// export async function findAvailablePeers(torrentId: ObjectId, peerId: ObjectId) {
//   return mongoDb
//     .collection(PEERS_COLLECTION)
//     .find({ torrentId, _id: { $ne: peerId } })
//     .project({ ip: 1, port: 1, pieces: 1 }) // Only include relevant fields
//     .toArray()
// }

export async function updatePeerPieces(peerId: ObjectId, pieces: string[]) {
  return mongoDb.collection(PEERS_COLLECTION).updateOne({ _id: peerId }, { $set: { pieces } })
}

export async function findPiecesByTorrentId(torrentId: ObjectId) {
  return mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .findOne({ _id: torrentId })
    .then((result) => result?.pieces)
}

export async function calculateQueryTime3(torrentId: ObjectId) {
  const startTime = process.hrtime()
  const result = await mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .find({ _id: torrentId })
    .project({ pieces: 1 })
    .explain('executionStats')
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  const executionTimeDbSide = result.executionStats.executionTimeMillis * 1e3
  return { executionTimeDbSide, executionTime }
}

export async function findPiecesByTorrentName(torrentName: string) {
  return mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .find({ name: torrentName })
    .project({ pieces: 1 })
    .toArray()
    .then((result) => result[0].pieces)
}

export async function calculateQueryTime2(torrentName: string) {
  const startTime = process.hrtime()
  const result = await mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .find({ name: torrentName })
    .project({ pieces: 1 })
    .explain('executionStats')
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  const executionTimeDbSide = result.executionStats.executionTimeMillis
  return { executionTimeDbSide, executionTime }
}

export async function findPeersWithTorrentId(torrentId: ObjectId) {
  return await mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .aggregate([
      {
        $match: { _id: torrentId }
      },
      {
        $unwind: '$pieces' // Flatten the pieces array for individual access
      },
      {
        $lookup: {
          from: PEERS_COLLECTION, // Join with peers collection
          let: { pieceHash: '$pieces.hash' }, // Pass each piece's hash as a variable
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$$pieceHash', '$hashPieces'] } // Check if the peer has this piece
              }
            },
            {
              $project: { ip: 1, port: 1, _id: 0 } // Select only relevant peer fields
            }
          ],
          as: 'peersWithPiece'
        }
      },
      {
        $unwind: '$peersWithPiece' // Flatten results to get individual peers
      },
      {
        $project: {
          hash: '$pieces.hash',
          ip: '$peersWithPiece.ip',
          port: '$peersWithPiece.port'
        }
      }
    ])
    .toArray()
}

export async function calculateQueryTime(torrentId: ObjectId) {
  const result = await mongoDb
    .collection(TORRENT_FILES_COLLECTION)
    .aggregate([
      {
        $match: { _id: torrentId }
      },
      {
        $unwind: '$pieces' // Flatten the pieces array for individual access
      },
      {
        $lookup: {
          from: PEERS_COLLECTION, // Join with peers collection
          let: { pieceHash: '$pieces.hash' }, // Pass each piece's hash as a variable
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$$pieceHash', '$hashPieces'] } // Check if the peer has this piece
              }
            },
            {
              $project: { ip: 1, port: 1, _id: 0 } // Select only relevant peer fields
            }
          ],
          as: 'peersWithPiece'
        }
      },
      {
        $unwind: '$peersWithPiece' // Flatten results to get individual peers
      },
      {
        $project: {
          hash: '$pieces.hash',
          ip: '$peersWithPiece.ip',
          port: '$peersWithPiece.port'
        }
      }
    ])
    .explain('executionStats')
  return result.stages[result.stages.length - 1].executionTimeMillisEstimate
}
