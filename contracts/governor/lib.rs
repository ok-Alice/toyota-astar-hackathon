#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod governor {
    use ink::prelude::vec::Vec;
    use openbrush::{

        traits::{
            Storage,
            String,
        },
    };

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum GovernorError {
        Custom(String),
    } 

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    type ProposalId = u32;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Governor {
        name: String,
    }

    impl Governor {

        #[ink(constructor)]
        pub fn new(
            name: String,
            _project: AccountId,
            _function: AccountId,
        ) -> Self {
            Governor { name }
        }
        /// Create new proposal for give ProjectID (can only be called by 
        /// project token holder)
        #[ink(message)]
        pub fn create_proposal(&mut self, _title: String) -> Result<(),GovernorError> {
            Ok(())
        } 

        /// List all open proposals for given project 
        #[ink(message)]
        pub fn list_proposals(&self, _internal: bool) -> Result<Vec<u32>,GovernorError> {
            Ok(Vec::default())
        }

        /// vote for given proposal Id
        #[ink(message)]
        pub fn vote(&mut self, _proposal: ProposalId) -> Result<(), GovernorError> {
            Ok(())
        }

        /// Current state of proposal
        #[ink(message)]
        pub fn proposal_state(&mut self, _proposal: ProposalId) -> Result<ProposalState, GovernorError> {
            Ok(ProposalState::Active)
        }
    }
}