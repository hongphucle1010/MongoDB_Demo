/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { createTorrentFile, deleteTorrentFile, readTorrentFileById, updateTorrentFile } from '../../models/TorrentFile'
import { ObjectId } from 'mongodb'

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
