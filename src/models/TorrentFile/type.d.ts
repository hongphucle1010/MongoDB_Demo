interface TorrentFile {
  _id: ObjectId
  name: string
  size: number
  pieces: Piece[]
}

interface Piece {
  _id: ObjectId
  index: number
  size: number
  hash: string
  peerIds: string[]
}