## Algorand TPS Test for Coin Transfer

##### Hardware: dedicated server at `nocix.net`

- Processor 2x E5-2660 @ 2.2GHz / 3GHz Turbo 16 Cores / 32 thread
- Ram 96 GB DDR3
- Disk 960 GB SSD
- Bandwidth 1Gbit Port: 200TB Transfer
- Operating System Ubuntu 18.04 (Bionic)

##### Network setup

- A network of 5 nodes was run.
- All nodes used the same IP, but different ports
- All nodes were participating for consensus; each was a block producer

##### Test setup for native coin transfer

- 100000 accounts were created for coin transfer
- 30000 native coin txs were submitted to the network as fast as possible
  - Each tx moved 1 Algo between two different randomly chosen accounts
  - The number of accounts was chosen to be equal to the number of total txs so that there would be a low chance of a tx getting rejected due to another transaction from the same account still pending.

##### Test result

- Tests are taken starting from 2000 tps to 6000 tps for 5 seconds. Time between the start of the test and the last block to process txs from the test was measured.
- Total txs/ Spam rate (TPS) + Spammer Count => Average tps
  - 20000 / 4000 + ( 2 spammers with 2000 tps ) => 869
  - 30000 / 6000 + ( 2 spammers with 3000 tps ) => 833 , 872
  - 30000 / 2000 + ( 3 spammers with 2000 tps ) => 857
- Estimated average tps is **800 - 900 TPS**
- [https://developer.algorand.org/docs/get-started/basics/why_algorand/#throughput](https://developer.algorand.org/docs/get-started/basics/why_algorand/#throughput)
- According to their claimed TPS is around **1000**.
- Our TPS measurement is from start spamming block time. So it’s always one block ahead of the txs included block. Due to this, it’s a bit lower than their TPS assumption.

##### Instructions to recreate this test

1.  Install required tools and dependencies.
    1. [https://developer.algorand.org/docs/run-a-node/setup/install/](https://developer.algorand.org/docs/run-a-node/setup/install/)
    2. Having _algod_ installed in the machine is enough for this test. So, following only this step [https://developer.algorand.org/docs/run-a-node/setup/install#debian-based-distributions-debian-ubuntu-linux-mint](https://developer.algorand.org/docs/run-a-node/setup/install/#debian-based-distributions-debian-ubuntu-linux-mint) is fine.
2.  Create a 5 local nodes network.

    1. This network is created referencing on this article [https://developer.algorand.org/tutorials/create-private-network/#1-create-network-template](https://developer.algorand.org/tutorials/create-private-network/#1-create-network-template)
    2. Since we are creating a 5 nodes network, our template config is as follows.

       ```
       {
          "Genesis": {
              "NetworkName": "",
              "Wallets": [
                  {
                      "Name": "Wallet1",
                      "Stake": 50,
                      "Online": true
                  },
                  {
                      "Name": "Wallet2",
                      "Stake": 10,
                      "Online": true
                  },
                  {
                      "Name": "Wallet3",
                      "Stake": 10,
                      "Online": true
                  },
                  {
                      "Name": "Wallet4",
                      "Stake": 10,
                      "Online": true
                  },
                  {
                      "Name": "Wallet5",
                      "Stake": 10,
                      "Online": true
                  },
                  {
                      "Name": "Wallet6",
                      "Stake": 10,
                      "Online": true
                  }
              ]
          },
          "Nodes": [
              {
                  "Name": "Primary",
                  "IsRelay": true,
                  "Wallets": [
                      {
                          "Name": "Wallet1",
                          "ParticipationOnly": false
                      }
                  ]
              },
              {
                  "Name": "Node1",
                  "Wallets": [
                      {
                          "Name": "Wallet2",
                          "ParticipationOnly": false
                      }
                  ]
              },
              {
                  "Name": "Node2",
                  "Wallets": [
                      {
                          "Name": "Wallet3",
                          "ParticipationOnly": false
                      }
                  ]
              },
              {
                  "Name": "Node3",
                  "Wallets": [
                      {
                          "Name": "Wallet4",
                          "ParticipationOnly": false
                      }
                  ]
              },
              {
                  "Name": "Node4",
                  "Wallets": [
                      {
                          "Name": "Wallet5",
                          "ParticipationOnly": false
                      }
                  ]
              },
              {
                  "Name": "Node5",
                  "Wallets": [
                      {
                          "Name": "Wallet6",
                          "ParticipationOnly": false
                      }
                  ]
              }
          ]
       }
       ```

    3. First, create user accounts using the script as mentioned in step 3.3. The publicAddresses.json file is needed here.
    4. Create the network with the network_template.json.
       - goal network create -r [root-directory] -n [name] -t my_network_template.json
       - e.g. goal network create -r net1 -n private -t my_network_template.json
    5. After creating the network, there will be each node’s directory under _net1_ as root directory.
    6. Add the public keys accounts from the publicAddresses.json file to each of the genesis.json files under _net1, net1/Node\*, net1/Primary_
       e.g. under Wallet6 key accounts, add these accounts data.

       ```
          {
            "addr": "RJUG6JBIHEPOFLDUBEJN355JQGM4V64NONYXH65JK5PTYXLMW23VFZTMGQ",
            "comment": "Wallet6",
            "state": {
              "algo": 1000000000000000,
              "onl": 1,
              "sel": "JQ1RlYUEqTKlzyzcSsC9iPIlY1JIbNjMi5x5OOa8sdM=",
              "vote": "nbxo2H+liExPurc6ZbrHvywFLhcQ4uzhbbJ9lrCO8Jc=",
              "voteKD": 10000,
              "voteLst": 3000000
            }
          },
          {
            "addr": "2Y6X5G3C4KECSFAF4Z3WKMV6PJ3W7WZZLNIUZG25G2XKYW4AL57HB7OT6Y",
            "comment": "",
            "state": {
              "algo": 100000000,
              "onl": 2
            }
          },
          {
            "addr": "4INKTNCB3LOLUOXJYNHBLN5Q4ECBOTX5HJOXOEIQZAQXPVJP66LLACU5GE",
            "comment": "",
            "state": {
              "algo": 100000000,
              "onl": 2
            }
          }
        ],
        "fees": "A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE",
        "id": "v1",
        "network": "private",
        "proto": "https://github.com/algorandfoundation/specs/tree/bc36005dbd776e6d1eaf0c560619bb183215645c",
        "rwd": "7777777777777777777777777777777777777777777777777774MSJUVU"
       ```

       So when the network is started, these user accounts are funded with some balance.

    7. Start the network.
       - goal network start -r net1
    8. Check the network status.
       - goal network status -r net1
    9. Stop the network.
       - goal network stop -r net1
    10. Delete the network.
        - goal network delete -r net1

3.  Custom Scripts used for running transactions to the network.

    1.  [https://gitlab.com/shardeum/smart-contract-platform-comparison/algorand](https://gitlab.com/shardeum/smart-contract-platform-comparison/algorand)
    2.  cd spam-client && npm install && npm link
    3.  To generate accounts that are to be added in the genesis.file before the network started.
        1. spammer accounts --number [number]
        2. This will create accounts.json and publicAddresses.json files under the directory.
        3. See step no.2(4) for additional steps
    4.  Replace the _port_number_ and _token_ variable with the values of the _algod.net_ and _algod.token_ from network _root_ directory from step no.2(4) (e.g under net1/Node1/)
    5.  Spam the network with these accounts and check the average TPS in each spam with step 6.

        - spammer spam --duration [number] --rate [number] --start [number] --end [number]

          --start (optional) is for the start index number of the accounts to use when spamming

          --end (optional) is for the end index number of the accounts to use when spamming

          e.g. To spam the network for 5 seconds with 10 tps

          spammer spam --duration 5 --rate 10 --start 0 --end 1000

    6.  Check the average TPS of the spam

        - spammer check_tps --output [json_file_name]

          e.g. spammer check_tps --output s158.json
