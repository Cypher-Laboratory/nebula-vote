import * as dotenv from 'dotenv';
import { createPoll, addChoice, vote } from './src/index';
import { abi } from './src/abi';
import { Curve, CurveName } from '@cypher-laboratory/ring-sig-utils/dist/src';

dotenv.config();

const SECP256K1 = new Curve(CurveName.SECP256K1);

function generateTestKeyPairs(count: number) {
  const privateKeys: bigint[] = [];
  const publicKeys: any[] = [];

  for (let i = 0; i < count; i++) {
    const privateKey = BigInt(
      `0x${(i + 100000).toString(16)}${'0'.repeat(40)}`
    );
    const publicKey = SECP256K1.GtoPoint().mult(privateKey);

    privateKeys.push(privateKey);
    publicKeys.push(publicKey);
  }

  return { privateKeys, publicKeys };
}

async function runDemo() {
  console.log('📊 Starting Opinion Polling SDK Demo 📊');
  console.log('---------------------------------------');

  try {
    console.log('Step 1: Creating a new poll...');
    const pollTitle = 'What is your favorite blockchain?';
    const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const choiceTitles = ['Ethereum', 'Starknet', 'Solana', 'Bitcoin'];

    const pollHash = await createPoll(
      pollTitle,
      expirationTime,
      choiceTitles,
      abi
    );
    console.log(`✅ Poll created successfully!`);
    console.log(`Transaction hash: ${pollHash}`);
    console.log('---------------------------------------');

    // Step 2: Add a new choice to the poll
    console.log('Step 2: Adding a new choice to the poll...');
    const newChoice = 'Polygon';
    const addChoiceHash = await addChoice(0, newChoice);
    console.log(`✅ Choice "${newChoice}" added successfully!`);
    console.log(`Transaction hash: ${addChoiceHash}`);
    console.log('---------------------------------------');

    console.log('Step 3: Voting on the poll...');
    const { privateKeys, publicKeys } = generateTestKeyPairs(5);

    // Choose a random private key from our generated set to sign with
    const signerIndex = 2; // Using the third key in our set
    const signerPrivKey = privateKeys[signerIndex];

    // Vote for choice ID 1 (Starknet in our example)
    const pollId = 0;
    const choiceId = 1;

    console.log(`Voting for choice ${choiceId} on poll ${pollId}...`);
    const voteResult = await vote(pollId, choiceId, signerPrivKey, publicKeys);

    console.log(`✅ Vote submitted successfully!`);
    console.log(`Transaction hash: ${voteResult.transaction_hash}`);
    console.log('---------------------------------------');

    console.log('📊 Demo completed successfully! 📊');
  } catch (error) {
    console.error('❌ Error during demo execution:');
    console.error(error);
  }
}

// Run the demo
runDemo()
  .then(() => {
    console.log('Demo process finished.');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
