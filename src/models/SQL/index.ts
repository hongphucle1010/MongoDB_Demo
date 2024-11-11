import postgreSqlClient from '../../lib/postgreSqlClient'

export async function initSql() {
  await postgreSqlClient.query(`
        CREATE TABLE IF NOT EXISTS TorrentFile (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            size INT NOT NULL
        );
  `)

  await postgreSqlClient.query(`
        CREATE TABLE IF NOT EXISTS Piece (
            index INT NOT NULL,
            size INT NOT NULL,
            torrentFileId INT NOT NULL REFERENCES TorrentFile(id),
            hash TEXT NOT NULL UNIQUE,
            PRIMARY KEY (index, torrentFileId)
        );
  `)

  await postgreSqlClient.query(`
        CREATE TABLE IF NOT EXISTS Peer (
            id SERIAL PRIMARY KEY,
            ip TEXT NOT NULL,
            port INT NOT NULL,
            isOnline BOOLEAN NOT NULL,
            download INT NOT NULL,
            upload INT NOT NULL
        );
  `)

  await postgreSqlClient.query(`
        CREATE TABLE IF NOT EXISTS PiecePeer (
            peerId INT NOT NULL REFERENCES Peer(id),
            pieceHash TEXT NOT NULL REFERENCES Piece(hash),
            PRIMARY KEY (peerId, pieceHash)
        );
  `)
}

export async function createTorrentFileSql(id: number, name: string, size: number) {
  const { rows } = await postgreSqlClient.query(
    `
        INSERT INTO TorrentFile (id, name, size)
        VALUES ($1, $2, $3)
        RETURNING *;
    `,
    [id, name, size]
  )

  return rows[0]
}

export async function readTorrentFileByIdSql(torrentFileId: number) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT * FROM TorrentFile
        WHERE id = $1;
    `,
    [torrentFileId]
  )

  return rows[0]
}

export async function updateTorrentFileSql(torrentFileId: number, updatedTorrentFile: Partial<TorrentFile>) {
  const { rows } = await postgreSqlClient.query(
    `
        UPDATE TorrentFile
        SET name = $2, size = $3
        WHERE id = $1
        RETURNING *;
    `,
    [torrentFileId, updatedTorrentFile.name, updatedTorrentFile.size]
  )

  return rows[0]
}

export async function deleteTorrentFileSql(torrentFileId: number) {
  await postgreSqlClient.query(
    `
        DELETE FROM TorrentFile
        WHERE id = $1;
    `,
    [torrentFileId]
  )
}

export async function createPieceSql(index: number, size: number, torrentFileId: number, hash: string) {
  const { rows } = await postgreSqlClient.query(
    `
        INSERT INTO Piece (index, size, torrentFileId, hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `,
    [index, size, torrentFileId, hash]
  )

  return rows[0]
}

export async function readPieceByHashSql(hash: string) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT * FROM Piece
        WHERE hash = $1;
    `,
    [hash]
  )

  return rows[0]
}

export async function readPieceByTorrentFileIdSql(torrentFileId: number) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT * FROM Piece
        WHERE torrentFileId = $1;
    `,
    [torrentFileId]
  )

  return rows
}

export async function deletePieceSql(hash: string) {
  await postgreSqlClient.query(
    `
        DELETE FROM Piece
        WHERE hash = $1;
    `,
    [hash]
  )
}

export async function createPeerSql(
  id: number,
  ip: string,
  port: number,
  isOnline: boolean,
  download: number,
  upload: number
) {
  const { rows } = await postgreSqlClient.query(
    `
        INSERT INTO Peer (id, ip, port, isOnline, download, upload)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `,
    [id, ip, port, isOnline, download, upload]
  )

  return rows[0]
}

export async function readPeerByIdSql(peerId: number) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT * FROM Peer
        WHERE id = $1;
    `,
    [peerId]
  )

  return rows[0]
}

export async function updatePeerSql(peerId: number, updatedPeer: Partial<Peer>) {
  const { rows } = await postgreSqlClient.query(
    `
        UPDATE Peer
        SET ip = $2, port = $3, isOnline = $4, download = $5, upload = $6
        WHERE id = $1
        RETURNING *;
    `,
    [peerId, updatedPeer.ip, updatedPeer.port, updatedPeer.isOnline, updatedPeer.download, updatedPeer.upload]
  )

  return rows[0]
}

export async function deletePeerSql(peerId: number) {
  await postgreSqlClient.query(
    `
        DELETE FROM Peer
        WHERE id = $1;
    `,
    [peerId]
  )
}

export async function createPiecePeerSql(peerId: number, pieceHash: string) {
  await postgreSqlClient.query(
    `
        INSERT INTO PiecePeer (peerId, pieceHash)
        VALUES ($1, $2);
    `,
    [peerId, pieceHash]
  )
}

export async function deletePiecePeerSql(peerId: number, pieceHash: string) {
  await postgreSqlClient.query(
    `
        DELETE FROM PiecePeer
        WHERE peerId = $1 AND pieceHash = $2;
    `,
    [peerId, pieceHash]
  )
}

export async function findAvailablePeersSql(pieceHash: string) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT Peer.*
        FROM Peer
        JOIN PiecePeer ON Peer.id = PiecePeer.peerId
        WHERE PiecePeer.pieceHash = $1;
    `,
    [pieceHash]
  )

  return rows
}

export async function findAvailablePiecesSql(peerId: number) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT Piece.*
        FROM Piece
        JOIN PiecePeer ON Piece.hash = PiecePeer.pieceHash
        WHERE PiecePeer.peerId = $1;
    `,
    [peerId]
  )

  return rows
}

export async function updatePeerDownloadSql(peerId: number, download: number) {
  const { rows } = await postgreSqlClient.query(
    `
        UPDATE Peer
        SET download = $2
        WHERE id = $1
        RETURNING *;
    `,
    [peerId, download]
  )

  return rows[0]
}

export async function updatePeerUploadSql(peerId: number, upload: number) {
  const { rows } = await postgreSqlClient.query(
    `
        UPDATE Peer
        SET upload = $2
        WHERE id = $1
        RETURNING *;
    `,
    [peerId, upload]
  )

  return rows[0]
}

export async function updatePeerOnlineStatusSql(peerId: number, isOnline: boolean) {
  const { rows } = await postgreSqlClient.query(
    `
        UPDATE Peer
        SET isOnline = $2
        WHERE id = $1
        RETURNING *;
    `,
    [peerId, isOnline]
  )

  return rows[0]
}

export async function clearTorrentFileWithLotsOfPiecesSql() {
  await postgreSqlClient.query(
    `
        DELETE FROM Piece
        WHERE torrentFileId = 999999;
    `
  )

  await postgreSqlClient.query(
    `
        DELETE FROM TorrentFile
        WHERE id = 999999;
    `
  )
}

export async function createTorrentWithLotsOfPiecesSql() {
  const sampleData = Array.from({ length: 1000 }, (_, index) => ({
    index,
    hash: 'hashDemO' + index,
    size: 111
  }))
  const query = `EXPLAIN ANALYZE WITH inserted_torrent AS (
      INSERT INTO torrentFile (id, name, size)
      VALUES (999999, 'torrentFileDemo', 1024)
      RETURNING id
    )
      INSERT INTO piece (index, torrentFileId, hash, size)
      VALUES 
      ${sampleData
        .map((piece) => `(${piece.index}, (SELECT id FROM inserted_torrent), '${piece.hash}', ${piece.size})`)
        .join(', ')}
`
  const startTime = process.hrtime()
  const { rows } = await postgreSqlClient.query(query)
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  return executionTime
}

export async function findPiecesByTorrentIdSql(torrentId: number) {
  const { rows } = await postgreSqlClient.query(
    `
        SELECT Piece.index, hash, Piece.size
        FROM Piece WHERE torrentfileid = $1;
    `,
    [torrentId]
  )

  return rows
}

export async function calculateSqlQueryTime3(torrentId: number) {
  const startTime = process.hrtime()

  const { rows } = await postgreSqlClient.query(
    `
    EXPLAIN ANALYZE SELECT Piece.*
    FROM Piece
    JOIN TorrentFile ON Piece.torrentFileId = TorrentFile.id
    WHERE TorrentFile.id = $1;
    `,
    [torrentId]
  )

  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  const executionTimeDbSide = getExecutionTime(rows)
  return { executionTimeDbSide, executionTime }
}

export async function findPiecesByTorrentNameSql(name: string) {
  const { rows } = await postgreSqlClient.query(
    `
        select piece.index, hash, piece.size from piece join torrentfile on torrentfile.id = piece.torrentfileid
        where name = $1
    `,
    [name]
  )
  console.log(name)
  return rows
}

export async function calculateSqlQueryTime2(name: string) {
  const startTime = process.hrtime()

  const { rows } = await postgreSqlClient.query(
    `
    EXPLAIN ANALYZE select piece.index, hash, piece.size from piece join torrentfile on torrentfile.id = piece.torrentfileid
    where name = $1
    `,
    [name]
  )
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  const executionTimeDbSide = getExecutionTime(rows)
  return { executionTimeDbSide, executionTime }
}

export async function findPeersWithTorrentSql(torrentId: number) {
  // With torrentId, we need to find the peers that have the pieces of the torrent, each piece just 1 peer
  const { rows } = await postgreSqlClient.query(
    `
        select distinct on (hash) hash, ip, port from piece 
        join piecepeer on piece.hash = piecePeer.pieceHash
        join peer on peer.id = piecepeer.peerid
        where torrentfileid = $1;

    `,
    [torrentId]
  )
  return rows
}

export async function calculateSqlQueryTime(torrentId: number) {
  const startTime = process.hrtime()

  const { rows } = await postgreSqlClient.query(
    `
    EXPLAIN ANALYZE select distinct on (hash) hash, ip, port from piece 
        join piecepeer on piece.hash = piecePeer.pieceHash
        join peer on peer.id = piecepeer.peerid
        where torrentfileid = $1;
    `,
    [torrentId]
  )
  const endTime = process.hrtime(startTime)
  const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6
  const executionTimeDbSide = getExecutionTime(rows)
  return { executionTimeDbSide, executionTime }
}

function getExecutionTime(queryPlan: { 'QUERY PLAN': string }[]): number | null {
  const executionTimeLine = queryPlan.find((line) => line['QUERY PLAN'].startsWith('Execution Time'))

  if (executionTimeLine) {
    const match = executionTimeLine['QUERY PLAN'].match(/Execution Time: ([\d.]+) ms/)
    if (match) {
      return parseFloat(match[1]) // Convert the extracted time to a number
    }
  }

  return null // Return null if Execution Time is not found
}
