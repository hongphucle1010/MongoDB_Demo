/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { createTorrentFile, deleteTorrentFile, readTorrentFileById, updateTorrentFile } from '../../models/TorrentFile'
import { ObjectId } from 'mongodb'
import { findAvailablePeers, upsertPeer } from '../../models/Peer'

export const createTorrentFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json(await createTorrentFile(req.body))
  }
)

export const readTorrentFileByIdController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json(await readTorrentFileById(new ObjectId(req.params.id)))
  }
)

export const updateTorrentFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json(await updateTorrentFile(new ObjectId(req.params.id), req.body))
  }
)

export const deleteTorrentFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json(await deleteTorrentFile(new ObjectId(req.params.id)))
  }
)

export const uploadTorrentController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, size, pieces } = req.body

    // Ensure the metadata has required fields
    if (!name || !size || !pieces || !Array.isArray(pieces)) {
      res.status(400).json({ message: 'Invalid metadata format.' })
      return
    }

    // Insert into the TorrentFiles collection
    const torrentFile = { name, size, pieces }
    const result = await createTorrentFile(torrentFile)

    res.status(200).json({ message: 'Torrent metadata uploaded successfully.', id: result.insertedId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error uploading torrent metadata.' })
  }
})

export const announceTorrentController = expressAsyncHandler(async (req, res, next) => {
  try {
    // eslint-disable-next-line prefer-const
    let { peerId, ip, port, torrentId, pieces } = req.body

    // Generate new peerId if not provided
    if (!peerId) {
      peerId = new ObjectId().toHexString() // Generate a new peerId
    }

    const peerData = {
      _id: ObjectId.createFromHexString(peerId),
      ip,
      port,
      isOnline: true,
      download: 0,
      upload: 0,
      torrentId: new ObjectId(torrentId),
      pieces
    }

    // Upsert the peer's data in the Peers collection
    await upsertPeer(peerData)

    // Find other peers with the same torrentId to suggest to this peer
    const availablePeers = await findAvailablePeers(torrentId, peerData._id)

    res.status(200).json({
      message: 'Peer announced successfully',
      peerId, // Return peerId to client if it was generated here
      availablePeers
    })
  } catch (error) {
    console.error('Error in /announce:', error)
    res.status(500).json({ message: 'Error announcing peer' })
  }
})
