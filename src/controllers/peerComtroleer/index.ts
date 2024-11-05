/* eslint-disable @typescript-eslint/no-unused-vars */
import expressAsyncHandler from 'express-async-handler'
import { createPeer, deletePeer, readPeerById, updatePeer } from '../../models/Peer'
import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'

export const createPeerController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.json(await createPeer(req.body))
})

export const readPeerByIdController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.json(await readPeerById(new ObjectId(req.params.id)))
})

export const updatePeerController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.json(await updatePeer(new ObjectId(req.params.id), req.body))
})

export const deletePeerController = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.json(await deletePeer(new ObjectId(req.params.id)))
})
