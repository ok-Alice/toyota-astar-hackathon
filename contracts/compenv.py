import os
import sys
import json
import random

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException


# Config

members = ['alice', 'bob', 'charlie', 'dave', 'eve', 'ferdie']
verbose = 1


titles = { 'alice' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
            'bob' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
            'charlie' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
            'dave' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
            'eve' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
            'ferdie' : { 
                'employee_project': 'UI Front-end 1',
                'project_voting_power': 1050,
            },
        }



def contract_from_address(contract_address, contract_name):
    contract = ContractInstance.create_from_address(
        contract_address=contract_address,
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink', contract_name + '.json'),
        substrate=substrate
    )

    print("✅ Loaded", contract_name, "from", contract_address, " CodeHash:", contract.metadata.source['hash']);

    return contract

########## Generic Functions

def contract_from_address(contract_address, contract_name):
    contract = ContractInstance.create_from_address(
        contract_address=contract_address,
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink', contract_name + '.json'),
        substrate=substrate
    )

    print("✅ Loaded", contract_name, "from", contract_address, " CodeHash:", contract.metadata.source['hash']);

    return contract


def show_events(events):
    first = True
    
    
    result = ""
    for event in events:
        if first:
            first = False
        else:
            result += "\n"
        result = "{" + event['name'] + " : "

        for arg in event['args']:
            result += arg['label'] + ':' + str(arg['value']) + " "
            
        result += "}  "
        
    return result

def contract_call(msg, keypair, contract, fname,  args):
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname}', end='')
        if contract_receipt.contract_events:
            print(f': Events { show_events(contract_receipt.contract_events) }', end='')
        print()
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print("      Args: ", args)

        
    
def contract_mint_to(msg, keypair, contract, dest: str) -> int:
    fname = 'Minting::mint'

    gas_predict = contract.read(keypair, fname, args={ 'to': dest })
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args={ 'to': dest })

    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events { show_events(contract_receipt.contract_events)}')
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
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
                print("Transfer Events:", receipt.triggered_events)
        else:
            print('⚠️ Extrinsic Failed: ', receipt.error_message)


    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))    




if len(sys.argv) != 2:
    print("Usage: ", sys.argv[0], " [input.json]")
    sys.exit(1)
    
infile_json = sys.argv[1]

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

kp = {}

kp['alice']   = Keypair.create_from_uri('//Alice')
kp['bob']     = Keypair.create_from_uri('//Bob')
kp['charlie'] = Keypair.create_from_uri('//Charlie')
kp['dave']    = Keypair.create_from_uri('//Dave')
kp['eve']     = Keypair.create_from_uri('//Eve')
kp['ferdie']  = Keypair.create_from_uri('//Ferdie')

print("Alice signs: ", kp['alice'])

with open(infile_json, 'r') as file:
    ids = json.load(file)
    
if verbose:
    print("♐ IDs:", ids)

project = contract_from_address(ids['contract']['project'], 'project')

employee_address = project.read(kp['alice'], 'employee_address').contract_result_data[1]
if verbose > 0:
    print("Employee:", employee_address)


## Employee from project call, and send it some funds from Alice

employee = contract_from_address(str(employee_address), "employee/employee")

total_supply = employee.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 10000)

transfer_balance(kp['alice'], str(employee_address), 10**17)

## Employee_project from create project, and send it some funds from Alice
project_id = random.randint(0, 2**32 -1)
project_asset_id = project_id
part_id = project_id

group_id = 1

contract_call("Create Project", kp['alice'], project, 'create_project', args = {
    'project_title': "My New project!",
    'project_id': project_id,
    })

eproject_address = project.read(kp['alice'], 'project_collection', args = {'project_id': project_id,}).contract_result_data[1][1]
if verbose > 0:
    print("eproject address:", eproject_address)

employee_project = contract_from_address(str(eproject_address), 'assignment/assignment')
total_supply = employee_project.read(kp['alice'], 'Minting::max_supply').contract_result_data[1]
assert(total_supply == 10000)

transfer_balance(kp['alice'], str(eproject_address), 10**17)

for member in members:
    ids[member]['employee_project'] = contract_mint_to('Mint Employee-Project for ' + member, kp['alice'], employee_project, kp[member].ss58_address) 
    contract_call("Employee_project metadata " + member,     kp['alice'], employee_project, "Minting::assign_metadata", args = { 'token_id': { 'U64' : ids[member]['employee_project']}, 'metadata': titles[member]['employee_project']})
    

contract_call(
     "Employee add_asset_entry on employee",
     kp['alice'],
     employee,
     'MultiAsset::add_asset_entry',
     args={
         'id': project_asset_id,
         'equippable_group_id': group_id,
         'asset_uri': 'asset_uri/',
         'part_ids': [part_id]
     },
)


# contract_call(
#     'add_equippable address on employee for employee_project', 
#     kp['alice'],
#     employee,
#     'Base::add_equippable_addresses',
#     args={ 
#         'part_id': part_id,
#         'equippable_address' : [ employee_project.contract_address ],
    
#     }
# )

for member in members:
    
    # Member tries to equip with project
    contract_call(
        "Employee " + member + " add_asset_to_token",
        kp[member],
        employee,
        'MultiAsset::add_asset_to_token',
        args={
            'token_id': { 'U64' : ids[member]['employee'] }, 
            'asset_id': project_asset_id,
            'replaces_asset_with_id': None
        },
    )

    contract_call(
        "Equip project for "+member,
        kp[member],
        employee,
        'Equippable::equip',
        args={
        'token_id':  { 'U64' : ids[member]['employee'] },
        'asset_id': project_asset_id,
        'slot_part_id': part_id,
        'child_nft' : ( employee_project.contract_address, { 'U64': ids[member]['employee_project'] } ),
        'child_asset_id': 0,        
        }
    )
