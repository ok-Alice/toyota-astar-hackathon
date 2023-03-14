import os
import sys
import random

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException


verbose = 0

########## Generic Functions

def contract_from_address(contract_address, contract_name):
    contract = ContractInstance.create_from_address(
        contract_address=contract_address,
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink', contract_name + '.json'),
        substrate=substrate
    )

    print("✅ Loaded", contract_name, "from", contract_address, " CodeHash:", contract.metadata.source['hash']);

    return contract


def contract_call(msg, keypair, contract, fname, allow_fail, args):
    print("Call:", fname, args)
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events {contract_receipt.contract_events}')
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print(f'    ** Events {contract_receipt.contract_events}')
        if not allow_fail:
            quit()
        
    
def contract_mint_to(msg, keypair, contract, dest: str) -> int:
    fname = 'Minting::mint'

    gas_predict = contract.read(keypair, fname, args={ 'to': dest })
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args={ 'to': dest })

    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events {contract_receipt.contract_events}')
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print(f'    ** Events {contract_receipt.contract_events}')
        quit()

    return contract_receipt.contract_events[0]['args'][2]['value']['U64']


def transfer_balance(kp_from, to, value):    
    call = substrate.compose_call(
        call_module='Balances',
        call_function='transfer',
        call_params={
            'dest': to,
            'value': value,
        }
    )

    extrinsic = substrate.create_signed_extrinsic(
        call=call,
        keypair=kp_from,
        era={'period': 64}
    )

    try:
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=True)

        if receipt.is_success:

            print('✅ Successful transfer from',kp_from, 'to', to, 'for', value)
            if verbose > 0:
                for event in receipt.triggered_events:
                    print(f'   -> {event.value}')

        else:
            print('⚠️ Extrinsic Failed: ', receipt.error_message)


    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))    

########## Cmdline & setup


if len(sys.argv) != 2:
    print("Usage: ", sys.argv[0], " [project-address]")
    sys.exit(1)
    
project_address = sys.argv[1]

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

members = ['alice', 'bob', 'charlie', 'dave', 'eve', 'ferdie']
kp = {}

kp['alice']   = Keypair.create_from_uri('//Alice')
kp['bob']     = Keypair.create_from_uri('//Bob')
kp['charlie'] = Keypair.create_from_uri('//Charlie')
kp['dave']    = Keypair.create_from_uri('//Dave')
kp['eve']     = Keypair.create_from_uri('//Eve')
kp['ferdie']  = Keypair.create_from_uri('//Ferdie')

print("Alice signs: ", kp['alice'])

transfer_balance(kp['alice'], project_address, 10**17)


## Project from cmd line arg

project = contract_from_address(project_address, 'project')

employee_address = project.read(kp['alice'], 'employee_address').contract_result_data[1]
if verbose > 0:
    print("Employee:", employee_address)

function_address =  project.read(kp['alice'], 'function_address').contract_result_data[1]
if verbose > 0:
    print("Function:", function_address)


## Employee from project call, and send it some funds from Alice

employee = contract_from_address(str(employee_address), "employee/employee")

total_supply = employee.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 100)

transfer_balance(kp['alice'], str(employee_address), 10**17)

## Function from project call, and send it some funds from Alice

project_id = random.randint(0, 2**32 -1);

employee_function = contract_from_address(str(function_address), 'assignment/assignment')
total_supply = employee_function.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 100)

transfer_balance(kp['alice'], str(function_address), 10**17)

## Employee_project from create project, and send it some funds from Alice

contract_call("Create Project", kp['alice'], project, 'create_project', False, args = {
    'project_id': project_id,
    })

eproject_address = project.read(kp['alice'], 'project_collection', args = {'project_id': project_id,}).contract_result_data[1][1]
if verbose > 0:
    print("eproject address:", eproject_address)

employee_project = contract_from_address(str(eproject_address), 'assignment/assignment')
total_supply = employee_project.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 100)

transfer_balance(kp['alice'], str(eproject_address), 10**17)


## Setting up employees


ids = {}

for member in members:
    ids[member] = {}
    ids[member]['employee'] = contract_mint_to('Mint Employee for ' + member, kp['alice'], employee, kp[member].ss58_address) 
    ids[member]['function'] = contract_mint_to('Mint Employee-Function for ' + member, kp['alice'], employee_function, kp[member].ss58_address) 
    ids[member]['project'] = contract_mint_to('Mint Employee-Project for ' + member, kp['alice'], employee_project, kp[member].ss58_address) 

#ids['Alice']['employee'] = contract_mint_to('Mint Employee-project for Alice', kp['alice'], employee, alice.ss58_address)

print("** IDs:", ids)


# Alice adds the part slots to employee

contract_call(
    "Employee",
    kp['alice'], 
    employee, 
    'Base::add_part_list', 
    allow_fail=False,
    args={
        'parts' : [  {
            'part_type': 'Slot',
            'z': 0,
            'equippable': [employee_project.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        {
            'part_type': 'Slot',
            'z': 1,
            'equippable': [employee_project.contract_address],
            'part_uri': "",
            'is_equippable_by_all': False,
            },
        ]
        },
)

# Alice creates two assets on employee, one for function, one for project
function_asset_id =  random.randint(0, 2**32 -1)
project_asset_id =  random.randint(0, 2**32 -1)
group_id = 1

contract_call(
    "Employee add_asset_entry",
    kp['alice'],
    employee,
    'MultiAsset::add_asset_entry',
    allow_fail=True,
    args={
        'id': function_asset_id,
        'equippable_group_id': group_id,
        'asset_uri': 'asset_uri/',
        'part_ids': [0]
    },
)

contract_call(
    "Employee add_asset_entry",
    kp['alice'],
    employee,
    'MultiAsset::add_asset_entry',
    allow_fail=True,
    args={
        'id': project_asset_id,
        'equippable_group_id': group_id,
        'asset_uri': 'asset_uri/',
        'part_ids': [0]
    },
)

contract_call(
    "Employee by Alice",
    kp['alice'],
    employee,
    'Equippable::equip',
    allow_fail=False,
    args={
    'token_id': str(ids['alice']['employee']),
    'asset_id': str(function_asset_id),
    'slot_part_id': 0,
    'child_nft' : ( employee_function.contract_address, { 'U64': ids['alice']['function'] } ),
    'child_asset_id': 0,        
    }
)




quit()

for member in members:
    #asset_id = ids[member]['employee']
    
    token_id = { 'U64': ids[member]['Function']}

    contract_call(
        "Employee by Alice",
        kp['alice'],
        employee,
        'Equippable::equip',
        allow_fail=False,
        args={
        'token_id': token_id,
        'asset_id': asset_id,
        'slot_part_id': 0,
        'child_nft' : ( employee_project.contract_address, { 'U64': 1 } ),
        'child_asset_id': 0,        
        }
    )


quit()


## Mint employee nft to bob

contract_call(
    "Employee add_asset_to_token",
    alice,
    employee,
    'MultiAsset::add_asset_to_token',
    allow_fail=True,
    args={
        'token_id': token_id,
        'asset_id': asset_id,
        'replaces_asset_with_id': None
    },
)




#contract_call('Mint Employee-project for Alice', alice, employee_project, 'Minting::mint', False, args={ 'to': alice.ss58_address})
#contract_call('Mint Employee-project for Bob', alice, employee_project, 'Minting::mint', False, args={ 'to': kp_bob.ss58_address})
#contract_call('Mint Employee-project for Charlie', alice, employee_project, 'Minting::mint', False, args={ 'to': kp_charlie.ss58_address})





