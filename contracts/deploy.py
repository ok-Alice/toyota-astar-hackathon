import os
import secrets

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair

from scalecodec.types import *

# # Enable for debugging purposes
import logging
logging.basicConfig(level=logging.WARN)


substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

kp_alice = Keypair.create_from_uri('//Alice')
kp_bob = Keypair.create_from_uri('//Bob')
kp_charlie = Keypair.create_from_uri('//Charlie')


#### Deploy Assignments for Projects & Functions

code = ContractCode.create_from_contract_files(
    metadata_file=os.path.join(os.path.dirname(__file__), '..', 'target', 'ink', 'assignments','assignments.json'),
    wasm_file=os.path.join(os.path.dirname(__file__), '..', 'target', 'ink', 'assignments', 'assignments.wasm'),
    substrate=substrate
)

project = code.deploy(
    keypair=kp_alice,
    endowment=0,
    gas_limit= 621923532800,
    storage_deposit_limit=1310720000000,
    constructor="new",
    args={
        'name': "Project",
        'symbol': "PRJ",
        'base_uri': "http://hello.world/",
        'max_supply': 100,
        'collection_metadata': "ipfs://over.there/"  
        },
    upload_code=True,
    deployment_salt= '0x{}'.format(secrets.token_hex(8))  #for random string
)

print("✅ Deployed Project : ",project.contract_address, "CodeHash:",project.metadata.source['hash']);

function = code.deploy(
    keypair=kp_alice,
    endowment=0,
    gas_limit= 621923532800,
    storage_deposit_limit=1310720000000,
    constructor="new",
    args={
        'name': "Function",
        'symbol': "FNC",
        'base_uri': "http://hello.world/",
        'max_supply': 100,
        'collection_metadata': "ipfs://over.there/"  
        },
    upload_code=True,
    deployment_salt= '0x{}'.format(secrets.token_hex(8))  #for random string
)

print("✅ Deployed Function: ",function.contract_address, "CodeHash:",function.metadata.source['hash']);


#### Deploy Employee

code = ContractCode.create_from_contract_files(
    metadata_file=os.path.join(os.path.dirname(__file__), '..', 'target', 'ink', 'employee','employee.json'),
    wasm_file=os.path.join(os.path.dirname(__file__), '..', 'target', 'ink', 'employee', 'employee.wasm'),
    substrate=substrate
)

employee = code.deploy(
    keypair=kp_alice,
    endowment=0,
    gas_limit= 621923532800,
    storage_deposit_limit=1310720000000,
    constructor="new",
    args={
        'name': "Employee",
        'symbol': "EMP",
        'base_uri': "http://hello.world/",
        'max_supply': 10000,
        'collection_metadata': "ipfs://over.there/"  
        },
    upload_code=True,
    deployment_salt= '0x{}'.format(secrets.token_hex(8))  #for random string
)

print("✅ Deployed Employee: ", employee.contract_address, "CodeHash:", employee.metadata.source['hash']);


result = employee.read(kp_alice, 'PSP34::collection_id')
print('  🤩 Employee CollectionId:', result.contract_result_data[1][1])


def contract_call(msg, contract, keypair, fname, args):
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events {contract_receipt.contract_events}')
    else:
        print(f'🤕 Error message: {contract_receipt.error_message}')
        print(f'  ** Events {contract_receipt.contract_events}')
        quit()
        
    return contract_receipt
    

### Call addPartList

contract_call(
    "Employee",
    employee, 
    kp_alice, 
    'Base::add_part_list', 
    args={
        'parts' : [  {
            'part_type': 'Slot',
            'z': 0,
            'equippable': [project.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        {
            'part_type': 'Slot',
            'z': 1,
            'equippable': [function.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        ]
        }, )

### Call Employee MintTo

contract_call(
    "Employee for Bob",
    employee,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_bob.ss58_address,
    }
)

contract_call(
    "Employee for Charlie",
    employee,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_charlie.ss58_address,
    }
)

### Call Project Minto

contract_call(
    "Project for Bob",
    project,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_bob.ss58_address,
    }
)

contract_call(
    "Project for Charlie",
    project,
    kp_alice,
    'Minting::mint',
    args={
        'to': kp_charlie.ss58_address,
    }
)

### Bob tries to equip project

contract_call(
    "Employee by Bob",
    employee,
    kp_bob,
    'Equippable::equip',
    args={
       'token_id': { 'U64': 1 },
       'asset_id': 0,
       'slot_part_id': 0,
       'child_nft' : ( project.contract_address, { 'U64': 1 } ),
       'child_asset_id': 0,        
    }
)
