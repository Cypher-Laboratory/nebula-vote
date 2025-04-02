import { RpcProvider, Account, Contract } from 'starknet/dist';
import { RingSignature } from '@cypher-laboratory/alicesring-sag-starknet/dist/starknet-sag-ts/src';
import { Curve, CurveName } from '@cypher-laboratory/ring-sig-utils/dist/src';

import { abi } from './abi';

const nodeUrl =
  process.env.STARKNET_NODE_URL ||
  'https://free-rpc.nethermind.io/sepolia-juno/v0_7';
const accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS;
const privateKeyAccount = process.env.STARKNET_PRIVATE_KEY;
const contractAddress = process.env.STARKNET_CONTRACT_ADDRESS;

if (!accountAddress) {
  throw new Error('STARKNET_ACCOUNT_ADDRESS environment variable is required');
}

if (!privateKeyAccount) {
  throw new Error('STARKNET_PRIVATE_KEY environment variable is required');
}

if (!contractAddress) {
  throw new Error('STARKNET_CONTRACT_ADDRESS environment variable is required');
}

const provider = new RpcProvider({
  nodeUrl,
});
const account = new Account(provider, accountAddress, privateKeyAccount);
const SECP256K1 = new Curve(CurveName.SECP256K1);

/**
 * Create a new poll
 * @param title The poll title
 * @param expirationTime Timestamp when the poll expires
 * @param choices Array of choice titles
 * @returns Transaction hash
 */
export async function createPoll(
  title: string,
  expirationTime: number,
  choices: string[],
  abi: any
) {
  const contract = new Contract(abi, contractAddress!);
  contract.connect(account);

  const createPollCall = contract.populate('create_poll', [
    title,
    expirationTime,
    choices,
  ]);

  const result = await contract.create_poll(createPollCall.calldata);
  await provider.waitForTransaction(result.transaction_hash);

  return result.transaction_hash;
}

/**
 * Add a new choice to an existing poll
 * @param pollId The poll ID
 * @param choiceTitle The title of the new choice
 * @returns Transaction hash
 */
export async function addChoice(pollId: number, choiceTitle: string) {
  const contract = new Contract(abi, contractAddress!);
  contract.connect(account);

  const addChoiceCall = contract.populate('add_choice', [pollId, choiceTitle]);
  const result = await contract.add_choice(addChoiceCall.calldata);
  await provider.waitForTransaction(result.transaction_hash);

  return result.transaction_hash;
}

/**
 * Vote on a poll using ring signature
 * @param pollId The poll ID
 * @param choiceId The choice ID
 * @param signerPrivKey Private key to sign the vote with
 * @param publicKeys Array of public keys to use in the ring signature
 * @returns Transaction details
 */
export async function vote(
  pollId: number,
  choiceId: number,
  signerPrivKey: bigint,
  publicKeys: any[]
) {
  const contract = new Contract(abi, contractAddress!);
  contract.connect(account);

  const ring = publicKeys.sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0));
  const signature = RingSignature.sign(
    ring,
    signerPrivKey,
    choiceId.toString(),
    SECP256K1
  );

  const rsCallData = await signature.getCallData();

  const result = await contract.invoke(
    'vote',
    [BigInt(pollId), BigInt(choiceId)].concat(rsCallData),
    {
      parseRequest: false,
    }
  );

  await provider.waitForTransaction(result.transaction_hash);
  return result;
}
