# EOS-Wonderful Emperor
By: Kim Sun-tae (S / W Specialist), Jun-hee Lee (Infosec Specialist)

Affiliation: Wonderful Platform Co., Ltd.

- - -
# Project Summary - EOS Wonderful

## purpose
 There are some difficulties in using the current (EOSIO / block-chain technology) to produce a real-life dApp (distributed application). First, the burden of cost for account creation and resource allocation is small. Secondly, it is difficult for general users to access the block chain. Someone wants to construct a private block chain because of this difficulty, which is a one-dimensional solution, and ultimately must seek other ways.


 EOS Wonderful provides a platform to solve these difficulties and create real-life adapts. At this time, the term 'platform' includes not only the service provider (including the developer) but also a way that ordinary users can easily use the adapter.

## goal
EOS Wonderful is developing to achieve the above purpose with the following aim.
1. Link public (EOS mainnet) with EOS Wonderful platform to satisfy "decentralization" which is a key element of block chain.
2. Minimize the cost of service provider (developer).
3. Provide client SDK to enhance general users' accessibility.
4. Provide a server SDK to maintain accessibility,
5. Publish all the necessary sources for EOS Wonderfulness's permanence to the end hub and assign the appropriate license.


## solution
<img src = "https://github.com/humblefirm/eos-wonderful/blob/master/papers/images/EWKAS.png" width = "100%"> </ img>
> [Left] Structure of existing EOS account, [Right] Structure of account with EOS Wonderful contract applied.

 To save money, not everyone creates an account. Because one account is shared by all, resources are used efficiently. Users are differentiated through double verification to solve various problems caused by sharing one account. Dual verification is implemented in Smart Contract within the EOS WONDERFUL account.

## Project outline
### Current Status Analysis
 EOS Wonderful is designed and built for real-life, public chain-based AD operations.
 
 To use the EOS mainnet, you need an EOS account. To create an EOS account, someone with an account must pay about $ 2,000. For example, the price of EOS is currently about 6370 won, 3200 bytes of RAM required for account creation accounts for the largest amount of about 0.3 EOS, and about 0.04 EOS for allocating 10 times transferable resources. going. A total of 0.34 EOS is consumed, and KRW is 2135 won. If the average resource utilization rate is 10%, EOS Wonderful will reduce RAM usage from 3200 bytes to 203 bytes, and the amount required for resource allocation will be reduced from 0.04EOS to 0.004EOS.
 
 Also, under the assumption that there is no load on the EOS network, the account must "hold" a small amount of money in order to obtain resources. It takes at least three days to recover the "held" money, and it is difficult to ensure the liquidity of the holding resource because it consumes a lot of resources at the level of several transfers.
 
 Most accounts are dormant accounts when the service is running, and most of the held amount becomes an unused surplus resource. Other non-dormant customers who use the service will have a shortage of resources.
 
 In other words, high account creation costs, waste due to inefficient resource allocation, and accessibility difficulties encountered when creating and using accounts are major obstacles to creating real-life adapters.


### Terminology
**Dual Verification**- A key way to validate your signature once more to identify multiple users sharing your account, a core feature of EOS Wonderful
**EOS Wonderful Smart Contract**- Smart contract code with dual verification and user data management capabilities and adapter related features
**EOS WONDERFUL ACCOUNT**- EOS account with EOS Wonderful Smart Contract, decentralized, but with default, owner of the account has admin and setup rights
**Server accounts**- Accounts that lend resources to users without accounts, consume resources that they do not use, and receive commissions as compensation
**Client SDK**- A development kit with the ability for user applications to communicate with the EOS WON account via a server account
**Server SDK**- Development kit for lending an account with resources that the client SDK will consume

### summary
 With EOS Wonderful, users without an account will be able to use the adapter. While all users' information is managed in the EOS WONDERFUL account, the account is decentralized and the smart concurrency doubly verifies the identity of the user, so there is no security issue and the same decentralization as using an existing account is guaranteed . Even if the resources of the Eos Wonderful Account are exhausted or the account providing server is down, it can be restarted immediately using another EOS account, or a server SDK opened by a third party with an EOS account. Decentralization is not compromised. This is because the identification of an individual is done through a double validation rather than a transaction's creator. Consequently, as long as the EOS chain is maintained, the EOS Wonderful continues accessibility / decentralization / security / integrity.
 
 The main components of EOS Wonderful are largely divided into three types of dual verification / accessibility / SDK.


### Dual Validation
<img src = "https://github.com/humblefirm/eos-wonderful/blob/master/papers/images/ETS.png" width = "100%"> </ img>
> Transaction structure of existing ies money transfer

 Before explaining the double validation, let's explain how transaction validation of EOS is done. To create a transaction in EOS, first create an action using the target action and account. It takes one or more of these actions in a transaction, signs all of the data in the transaction with a private key that matches the account's public key, and sends it in the transaction. Subsequently, the nodes verify their identity by un-signing with the public key of the account name in the transaction.

 
<img src = "https://github.com/humblefirm/eos-wonderful/blob/master/papers/images/EWTS.png" width = "100%"> </ img>
 > Transfers Transaction Structure in EOS Wonderful
 
 The signature information is recorded at the outermost of the transaction. There is a difference in this part from the double verification. Dual validation identifies an individual using public key information and signature information written inside the transaction, inside the action, and inside the data, if the transaction's signature is normal. In other words, in identifying an individual, it does not matter what account that generated the transaction. It is possible to share one account with multiple accounts because only the signature information inside the data identifies the individual.

### accessibility
 Accessibility is one of the most important factors. Except for the intermediate process of creating an account, EOS WONDERFUL uses a similar key-account method to use it without an account. The public key itself is the account.
 
 <img src = "https://github.com/humblefirm/eos-wonderful/blob/master/papers/images/EWPI.png" width = "100%"> </ img>
 > Key-to-Index method for fast multi-index lookup
 
 For immediate account lookup, the first 28 bits of the public key are converted to an integer and used as the index key. This allows users to immediately see their key-account data. If you do not have such a design, you will need to look up the account information of everyone who uses your EOS Wonderful account to look up your own data or deposit it in another person, and look up the key of yourself and the subject. EOS Wonders are the first time users of EOS can deposit / inquire / send money, and everything else right away, without any intermediate steps.

### SDK
 The SDK is a toolkit tailored to the EOS Wonderful protocol and is essential for creating or delivering adapters. Basically, in order to create a double-verified action, you must generate a signature that corresponds to the signature verification method of Smart Contract. Dual verification has a unique structure and therefore has a potential vulnerability to replay-attack. The transaction-creation process is further complicated by the introduction of the Account-state nonce concept to solve this problem.
 
 The client SDK will automate all of this to create actions. In addition, it communicates with the server SDK, borrows the account of another person, creates a transaction, propagates it, and uses the service. The Server SDK is required to provide users with accounts that actually consume resources to generate transactions. The client connects to the server to which the server SDK is applied and transfers the action that it created by using the resources of the actual account.
 
 At the same time, the server SDK is required to maintain the structural integrity and maintain the perpetuity of the service, the most important component of decentralization. In EOS Wonderful, consuming real resources is the server account that generates transactions. The resources assigned to this account and the account will usually be provided by the company providing the adapter.
 
 There is a problem here. You can arbitrarily discontinue smart contract-based services that do not acquire the resources of the account or provide decentralization by downing the server account. However, in this case, anyone with an EOS account can use their account and an automated server SDK to resume service.
 
 The resources consumed by providing the service will be reimbursed in accordance with the EOS Wonderful Fee Policy. This usually provides incentives for multiple account servers to be created and maintained in addition to corporate account servers, providing users with choices and decentralization.
 
 In other words, the user is able to "mined" by providing the resources of the account that he has not used to the goodness of the EOS, and he is compensated. Ultimately contributing to the development of the ecosystem.


- - -