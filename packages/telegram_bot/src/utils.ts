import { ButtonInteraction } from "discord.js";
import { createHash } from 'crypto';
import { Curve, CurveName, Point } from "@cypher-laboratory/ring-sig-utils";
import sqlite3 from 'sqlite3';
import { Context } from "telegraf";

const NEBULA_SALT = process.env.NEBULA_SALT || '';
const RING_SIZE = Number(process.env.RING_SIZE || "5");

if (!NEBULA_SALT || NEBULA_SALT === '') {
  throw new Error("NEBULA_SALT is not defined and cannot be empty");
}

export function getUserPrivateKey(ctx: Context): bigint {
  const userId = ctx.from?.id || 0;
  const server = ctx.chat?.id || 1;

  const key = NEBULA_SALT + userId + server;

  // Create a SHA-256 hash of the key
  const hash = createHash('sha256').update(key).digest('hex');

  // Convert the hash to a BigInt
  const privateKey = BigInt('0x' + hash);

  return privateKey;
}

export async function getRing(userId: number, signerPub: Point): Promise<Point[]> {
  const db = new sqlite3.Database('polls.db');

  const publicKeys: Point[] = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * 
      FROM user_pub_keys
      WHERE public_key != ?
      ORDER BY RANDOM()
      LIMIT ?;`,
      [signerPub.serialize(), RING_SIZE - 1], // Exclude the signer's public key
      (err, rows: any) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("publicKeys", rows);

        try {
          // Assuming you need to convert the serialized keys back to Point objects
          const ringMembers = rows.map((row: { public_key: string; }) => Point.deserialize(row.public_key));
          resolve(ringMembers);
        } catch (error) {
          reject(error);
        }
      }
    );
  });

  // include the signer's public key
  publicKeys.push(signerPub);

  // add the signer public key to the table (ignoring errors)
  await db.run(
    `INSERT OR IGNORE INTO user_pub_keys (user_id, public_key) VALUES (?, ?);`,
    [userId, signerPub.serialize()],
    (err) => {
      if (err) {
        console.error("Error inserting signer's public key", err);
      }
    }
  );

  db.close();

  if (publicKeys.length !== RING_SIZE) {
    // generate decoys
    const decoys = Array.from({ length: RING_SIZE - publicKeys.length }, () => randomPoint());
    return publicKeys.concat(decoys); // the ring is ordered deterministically in the `vote` function from sc-wrapper
  }

  return publicKeys; // the ring is ordered deterministically in the `vote` function from sc-wrapper
}


function randomPoint() {
  const privateKey = createHash('sha256').update(Math.floor(Math.random() * 1000000).toString()).digest('hex');
  return (new Curve(CurveName.SECP256K1)).GtoPoint().mult(BigInt('0x' + privateKey));
}