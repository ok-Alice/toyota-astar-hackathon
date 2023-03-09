#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod project {
    use ink::prelude::vec::Vec;
    use openbrush::{

        traits::{
            Storage,
            String,
        },
    };

    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ProjectError {
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
    pub struct Project {
        name: String,
    }

    impl Project {

        #[ink(constructor)]
        pub fn new(
            name: String,
            _employee: AccountId,
        ) -> Self {
            Project { name }
        }
        /// Create new proposal for give ProjectID (can only be called by 
        /// project token holder)
        #[ink(message)]
        pub fn create_proposal(&mut self, _title: String) -> Result<(),ProjectError> {
            Ok(())
        } 

        /// List all open proposals for given project 
        #[ink(message)]
        pub fn list_proposals(&self, _internal: bool) -> Result<Vec<u32>,ProjectError> {
            Ok(Vec::default())
        }

        /// vote for given proposal Id
        #[ink(message)]
        pub fn vote(&mut self, _proposal: ProposalId) -> Result<(), ProjectError> {
            Ok(())
        }

        /// Current state of proposal
        #[ink(message)]
        pub fn proposal_state(&mut self, _proposal: ProposalId) -> Result<ProposalState, ProjectError> {
            Ok(ProposalState::Active)
        }
    }
}