#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod project {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    use ink_env::hash::{Sha2x256, HashOutput};

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


    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ProposalCore {
        pub vote_start: BlockNumber,
        pub vote_end:   BlockNumber,
        pub executed: bool,
        pub canceled: bool,
        pub internal: bool,
    }


    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Project {
        name: String,
        proposals: Mapping<ProposalId, ProposalCore>,
        proposal_ids: Vec<ProposalId>,
        voting_delay: BlockNumber,
        voting_period: BlockNumber,
    }

    impl Project {

        #[ink(constructor)]
        pub fn new(
            name: String,
            _employee: AccountId,
        ) -> Self {
            let proposals = Mapping::default();
            let proposal_ids = Vec::new();
            Project { name, proposals, proposal_ids, voting_delay: 0, voting_period: 10 }
        }

        #[ink(message)]
        pub fn gen_proposal_id(&self, title: String) -> Result<ProposalId, ProjectError> {
            let mut output = <Sha2x256 as HashOutput>::Type::default(); // 256-bit buffer
            ink_env::hash_bytes::<Sha2x256>(&title, &mut output);
            Ok(u32::from_ne_bytes([output[0], output[1], output[2], output[3]]))
        }

        /// Create new proposal for give ProjectID (can only be called by 
        /// project token holder)
        #[ink(message)]
        pub fn create_proposal(&mut self, title: String, internal: bool) -> Result<(),ProjectError> {
            let proposal_id = self.gen_proposal_id(title)?;

            if self.proposals.get(&proposal_id).is_some() {
                return Err(ProjectError::Custom(String::from("Proposal already exists")));
            }

            let proposal = ProposalCore {
                vote_start: self.env().block_timestamp() as u32 + self.voting_delay,
                vote_end:   self.env().block_timestamp() as u32 + self.voting_delay + self.voting_period,
                executed: false,
                canceled: false,
                internal,
            };

            self.proposals.insert(proposal_id, &proposal);

            Ok(())
        } 

        /// List all open proposals for given project 
        #[ink(message)]
        pub fn list_proposal_ids(&self) -> Vec<ProposalId> {
            self.proposal_ids.clone()
        }

        #[ink(message)]
        pub fn get_proposal_details(&self, proposal_id: ProposalId) -> Result<ProposalCore, ProjectError> {
            match self.proposals.get(proposal_id) {
                Some(pc) => Ok(pc),
                None => Err(ProjectError::Custom(String::from("Proposal does not exist")))
            }
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


        #[ink(message)]
        pub fn voting_delay(&self) -> BlockNumber {
            self.voting_delay
        }

        #[ink(message)]
        pub fn voting_period(&self) -> BlockNumber {
            self.voting_period
        }

        #[ink(message)]
        pub fn set_voting_delay(&mut self, voting_delay: BlockNumber) -> Result<(),ProjectError> {
            self.voting_delay = voting_delay;
            Ok(())
        }

        #[ink(message)]
        pub fn set_voting_period(&mut self, voting_period: BlockNumber) -> Result<(),ProjectError> {
            self.voting_period = voting_period;
            Ok(())
        }


    }
}