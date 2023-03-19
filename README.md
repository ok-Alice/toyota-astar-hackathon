# okAlice Toyota Hachkathon Frontend

## Getting Started

First, install packages (node v19)

```bash
yarn install
```

Create .env file with needed variables, ex:

```bash
NEXT_PUBLIC_APP_NAME=client
NEXT_PUBLIC_PROVIDER_SOCKET=ws://127.0.0.1:9944
NEXT_PUBLIC_PROPOSAL_VOTING_DELAY=0
NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD=10
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS=0x000000
```

Run the development server:

```bash
yarn dev
```

Build for production

```bash
yarn build
```

## Where to change files when you deploy our initial setup on swanky node

Modify contract addresses in .env

```
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS=<contract_address>
```

If needed, update contract metadata json files in /abis/ folder

Update JSON db files with projectIds, proposalIds and employeeIds given in backend deploy script
