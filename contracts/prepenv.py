import os
import sys
import random

from substrateinterface.contracts import ContractCode, ContractInstance
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException


verbose = 0

##########

def contract_from_address(contract_address, contract_name):
    contract = ContractInstance.create_from_address(
        contract_address=contract_address,
        metadata_file=os.path.join(os.path.dirname(__file__), 'project', 'target', 'ink', contract_name + '.json'),
        substrate=substrate
    )

    print("✅ Loaded", contract_name, "from", contract_address, " CodeHash:", contract.metadata.source['hash']);

    return contract


def contract_call(msg, keypair, contract, fname, args):
    gas_predict = contract.read(keypair, fname, args)
    
    gas_predict.gas_required['ref_time'] *= 100;
    gas_predict.gas_required['proof_size'] *= 100;
    
    contract_receipt = contract.exec(keypair, fname, args)
    
    if contract_receipt.is_success:
        print(f'  😎 Call {msg} {fname} : Events {contract_receipt.contract_events}')
    else:
        print(f'  🤕 Error {msg} {fname}: {contract_receipt.error_message}')
        print(f'    ** Events {contract_receipt.contract_events}')
        quit()
        
    return contract_receipt
    
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

            print('✅ Successful transfer from',kp_alice, 'to', to, 'for', value)
            if verbose > 0:
                for event in receipt.triggered_events:
                    print(f'   -> {event.value}')

        else:
            print('⚠️ Extrinsic Failed: ', receipt.error_message)


    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))    




if len(sys.argv) != 2:
    print("Usage: ", sys.argv[0], " [project-address]")
    sys.exit(1)
    
project_address = sys.argv[1]

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    type_registry_preset='canvas'
)

kp_alice = Keypair.create_from_uri('//Alice')
kp_bob = Keypair.create_from_uri('//Bob')
kp_charlie = Keypair.create_from_uri('//Charlie')

print("Alice signs: ", kp_alice)

transfer_balance(kp_alice, project_address, 10**17)


## Project from cmd line arg

project = contract_from_address(project_address, 'project')

employee_address = project.read(kp_alice, 'employee_address').contract_result_data[1]
if verbose > 0:
    print("Employee:", employee_address)

function_address =  project.read(kp_alice, 'function_address').contract_result_data[1]
if verbose > 0:
    print("Function:", function_address)


## Employee from project call, and send it some funds from Alice

employee = contract_from_address(str(employee_address), "employee/employee")

total_supply = employee.read(kp_alice, 'PSP34::total_supply').contract_result_data[1]
assert(total_supply == 0)

transfer_balance(kp_alice, str(employee_address), 10**17)

## Function from project call, and send it some funds from Alice

project_id = random.randint(0, 2**32 -1);

employee_function = contract_from_address(str(function_address), 'assignment/assignment')
total_supply = employee_function.read(kp_alice, 'PSP34::total_supply').contract_result_data[1]
assert(total_supply == 0)

transfer_balance(kp_alice, str(function_address), 10**17)

## Employee_project from create project, and send it some funds from Alice

contract_call("Create Project", kp_alice, project, 'create_project', args = {
    'project_id': project_id,
})

eproject_address = project.read(kp_alice, 'project_collection', args = {'project_id': project_id,}).contract_result_data[1][1]
if verbose > 0:
    print("eproject address:", eproject_address)

employee_project = contract_from_address(str(eproject_address), 'assignment/assignment')
total_supply = employee_project.read(kp_alice, 'PSP34::total_supply').contract_result_data[1]
assert(total_supply == 0)

transfer_balance(kp_alice, str(eproject_address), 10**17)


## Mint employee nft to bob

contract_call('Mint Employee for Bob', kp_alice, employee, 'Minting::mint', args={ 'to': kp_alice.ss58_address})


