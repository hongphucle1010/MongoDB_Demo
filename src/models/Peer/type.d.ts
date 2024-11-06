interface Peer {
  _id: ObjectId
  ip: string
  port: number
  isOnline: boolean
  download: number
  upload: number
  pieces?: number[]
}
