import { ButtonInteraction } from "discord.js";
import { createHash } from 'crypto';
import { Point } from "@cypher-laboratory/ring-sig-utils";
import sqlite3 from 'sqlite3';

const NEBULA_SALT = process.env.NEBULA_SALT;
const RING_SIZE = Number(process.env.RING_SIZE || "16");

if (!NEBULA_SALT) {
  throw new Error("NEBULA_SALT is not defined")
}

export function getUserPrivateKey(interaction: ButtonInteraction): bigint {
  const userId = interaction.user.id;
  const server = interaction.guildId || "";

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
        // Close the database connection when done
        db.close();

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
  db.run(
    `INSERT OR IGNORE INTO user_pub_keys (user_id, public_key) VALUES (?, ?);`,
    [userId, signerPub.serialize()],
    (err) => {
      if (err) {
        console.error("Error inserting signer's public key", err);
      }
    }
  );

  return publicKeys; // the ring is ordered deterministically in the `vote` function from sc-wrapper
}