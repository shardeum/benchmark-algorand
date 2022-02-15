#!/usr/bin/env node
import fs from 'fs'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import algosdk from 'algosdk';



/**
 * Connection to the network
 */
let algodClient: algosdk.Algodv2

/**
 * Keypair associated to the fees' payer
 */
let Accounts: algosdk.Account

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const algodToken = '66c8d5fec94d65c0892e58283685fe6ed31f616c5e5866d5316df0142347428d';
  const algodServer = 'http://localhost';
  const algodPort = 37571;
  algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
}

/**
 * Create accounts and fund tokens
 */
export function createAccountsAndFundTokens(): algosdk.Account {
  return algosdk.generateAccount();
}

async function createAccounts(number: number) {
  const accounts = new Array(number)
    .fill(0)
    .map(() => createAccountsAndFundTokens())
  return accounts
}

interface spamOptions {
  duration: number
  rate: number
  start: number
  end: number
}

yargs(hideBin(process.argv))
  .command(
    'spam',
    'spam nodes for [duration] seconds at [rate] tps',
    () => { },
    async (argv: spamOptions) => {
      await establishConnection()
      spam(argv)
    }
  )
  .option('duration', {
    alias: 'd',
    type: 'number',
    description: 'The duration (in seconds) to spam the network',
  })
  .option('start', {
    alias: 's',
    type: 'number',
    description: 'The starting index on accounts to use when spamming',
  })
  .option('end', {
    alias: 'e',
    type: 'number',
    description: 'The ending index on accounts to use when spamming',
  })
  .option('rate', {
    alias: 'r',
    type: 'number',
    description: 'The rate (in tps) to spam the network at',
  }).argv

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}


interface accountsOptions {
  number: number
}

yargs(hideBin(process.argv))
  .command(
    'accounts',
    'generate accounts --number [number]',
    () => { },
    async (argv: accountsOptions) => {
      // await establishConnection()
      let accounts = await createAccounts(argv.number)
      let accountsWithFund = []
      for (let i = 0; i < accounts.length; i++) {
        let fundAccount = {
          "addr": accounts[i].addr,
          "comment": "",
          "state": {
            "algo": 100000000,
            "onl": 2
          }
        }
        accountsWithFund.push(fundAccount)
      }
      try {
        fs.writeFileSync('publicAddresses.json', JSON.stringify(accountsWithFund, null, 2))
        fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 0))
        console.log(
          `Wrote ${accounts.length} account${accounts.length > 1 ? 's' : ''
          } to accounts.json`
        )
      } catch (error) {
        console.log(`Couldn't write accounts to file: ${error.message}`)
      }
    }
  )
  .option('type', {
    alias: 'number',
    type: 'number',
    description: 'number of accounts',
  }).argv

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const spam = async (argv: spamOptions) => {
  let tps = argv.rate
  let duration = argv.duration
  let txCount = tps * duration
  let accounts
  try {
    accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'))
    console.log(
      `Loaded ${accounts.length} account${accounts.length > 1 ? 's' : ''
      } from accounts.json`
    )
  } catch (error) {
    console.log(`Couldn't load accounts from file: ${error.message}`)
    return
  }
  // Shuffling the accounts array not to run into issue when another client is also spamming at the same time
  // shuffle(accounts)
  // const filteredAccount = accounts.slice(0, txCount)
  for (var i in accounts) {
    accounts[i].sk = Uint8Array.from(
      Object.values(accounts[i].sk)
    )
  }
  let k = 0
  let amount = 1000
  // we don't want to add any extra data to the tx so undefined
  let note = undefined;

  // Define params
  let revocationTarget = undefined;
  let closeRemainderTo = undefined;
  let params = await algodClient.getTransactionParams().do();

  //comment out the next two lines to use suggested fee
  // params.fee = 1000;
  // params.flatFee = true;
  let signedTxs = []

  for (let i = 0; i < txCount; i++) {
    // console.log('Injected tx:', i + 1)
    if (k >= accounts.length - 1) {
      k = 0
    }
    const txn = await algosdk.makePaymentTxnWithSuggestedParams(accounts[k].addr, accounts[++k].addr,
      amount, undefined, note, params);
    const signedTxn = txn.signTxn(accounts[k - 1].sk)
    signedTxs.push(signedTxn)
    k++
  }

  const waitTime = (1 / tps) * 1000
  let currentTime
  let sleepTime
  let elapsed
  let LatestBlockBeforeSpamming = await algodClient.status().do()
  console.log('LatestBlockBeforeSpamming', LatestBlockBeforeSpamming['last-round'])
  let spamStartTime = Math.floor(Date.now() / 1000)
  let lastTime = Date.now()
  for (let i = 0; i < txCount; i++) {

    // Submit the transaction
    // let tx = await algodClient.sendRawTransaction(signedTxn).do().catch(e => { console.log(e) });
    // console.log(tx)
    try {
      algodClient.sendRawTransaction(signedTxs[i]).do();
    } catch (e) {
      // console.log(e.status)
    }
    currentTime = Date.now()
    elapsed = currentTime - lastTime
    sleepTime = waitTime - elapsed
    if (sleepTime < 0) sleepTime = 0
    await sleep(sleepTime)
    lastTime = Date.now()
  }
  let spamEndTime = Math.floor(Date.now() / 1000)
  var timeDiff = spamEndTime - spamStartTime; //in ms
  // strip the ms
  // timeDiff /= 1000;
  // get seconds 
  var seconds = Math.round(timeDiff);

  let LatestBlockAfterSpamming = await await algodClient.status().do()
  console.log('LatestBlockAfterSpamming', LatestBlockAfterSpamming['last-round'])
  console.log('totalSpammingTime', seconds)


  // const last_round = await algodClient.status().do()
  // const block_number = last_round['last-round']
  // console.log(await algodClient.block(block_number).do())


  // let sender = await algodClient.accountInformation(accounts[0].addr).do();
  // console.log("Account balance: %d microAlgos", sender.amount);

  // console.log(await utils.waitForConfirmation(algodClient, tx.txId, 3))
  // let last_round = await algodClient.status().do()
  // let block_number = last_round['last-round']
  // console.log(await algodClient.block(block_number).do())
  // last_round = await algodClient.status().do()
  // block_number = last_round['last-round']
  // let a = await algodClient.block(2992).setIntDecoding(algosdk.IntDecoding.MIXED).do()
  // console.log(a)

}

interface blockOptions {
  output: string
}

yargs(hideBin(process.argv))
  .command(
    'check_tps',
    'get tps --output file.json',
    () => { },
    async (argv: blockOptions) => {
      await establishConnection()
      getTPS(argv)
    }
  )
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'To save the blocks info into a json file',
  }).argv

const getTPS = async (argv: blockOptions) => {
  let startblock
  let output = argv.output
  let startTime
  let endTime
  let endblock
  let totalTransactions = 0
  let blockInfo: any
  let lastestBlock = await algodClient.status().do()
  let block_number = lastestBlock['last-round']
  while (true) {
    // console.log(block_number)
    try {
      blockInfo = await algodClient.block(block_number).do()
    } catch (e) {
      break
    }
    if (endblock && !blockInfo.block.txns) {
      startblock = block_number
      startTime = blockInfo.block.ts
      fs.appendFile(output, JSON.stringify(blockInfo, null, 0), function (err) {
        if (err) throw err;
      });
      break
    }
    if (blockInfo.block.txns) {
      console.log(block_number, blockInfo.block.txns.length)
      blockInfo.transactionsSize = blockInfo.block.txns.length
      totalTransactions += blockInfo.block.txns.length
      if (!endblock) {
        endblock = block_number
        endTime = blockInfo.block.ts
      }
      fs.appendFile(output, JSON.stringify(blockInfo, null, 0), function (err) {
        if (err) throw err;
      });
    }
    block_number--
  }
  let averageTime = endTime - startTime;
  console.log('startBlock', startblock, 'endBlock', endblock)
  console.log(`total time`, averageTime)
  console.log(`total txs:`, totalTransactions)
  console.log(`avg tps`, totalTransactions / averageTime)
}
