#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod project {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    use ink::env::hash::{Sha2x256, HashOutput};

    use employee::rmrk_employee::RmrkEmployeeRef;
    use assignment::rmrk_assignment::RmrkAssignmentRef;

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

    #[derive(scale::Encode, scale::Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum VoteType {
        Against,
        For,
        Abstain
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
    }

    type ProposalId = u32;
    type ProjectId = u32;


    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ProposalCore {
        pub vote_start: BlockNumber,
        pub vote_end:   BlockNumber,
        pub canceled: bool,
        pub internal: bool,
    }

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ProposalVote {
        pub votes_against: u32,
        pub votes_for:     u32,
        pub votes_abstain: u32,
        pub has_voted: Vec<AccountId>,
    }

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct Project {
        name: String,
        voting_delay: BlockNumber,
        voting_period: BlockNumber,
        employee: Option<RmrkEmployeeRef>,
        employee_function: Option<RmrkAssignmentRef>,
        employee_project: Mapping<ProjectId, RmrkAssignmentRef>,
        proposals: Mapping<(ProjectId, ProposalId), ProposalCore>,
        proposal_ids: Mapping<ProjectId, Vec<ProposalId>>,
        votes: Mapping<(ProjectId, ProposalId), ProposalVote>,
        assignment_hash: Hash,
    }

    impl Project {

        #[ink(constructor)]
        pub fn new(
            name: String,
            assignment_hash: Hash,
            employee_hash: Hash,
        ) -> Self {
            let proposals = Mapping::default();
            let proposal_ids = Mapping::default();
            let employee_project = Mapping::default();
            let votes = Mapping::default();

            let salt = Self::env().block_number().to_le_bytes();
            let employee = RmrkEmployeeRef::new(
                String::from("Employee"),
                String::from("EMP"),
                String::from("http://hello.world/"),
                100,
                String::from("ipfs://over.there/"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(employee_hash)
            .salt_bytes(salt)
            .instantiate();

            let function = RmrkAssignmentRef::new(
                String::from("Function"),
                String::from("FNC"),
                String::from("http://hello.world"),
                100,
                String::from("ipfs://over.there"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(assignment_hash)
            .salt_bytes(salt)
            .instantiate();


            Self { 
                name, 
                proposals, 
                proposal_ids, 
                voting_delay: 0, 
                voting_period: 10,
                employee: Some(employee),
                employee_function: Some(function),
                employee_project,
                votes,
                assignment_hash,
             }
        }


        /// Return the AccountId of the instantiated Employee contract
        #[ink(message)]
        pub fn employee_address(&self) -> AccountId {
            self.employee.clone().unwrap().account_id()
        }

        /// Return the AccountId of the instantiated Function (from assignment) contract
        #[ink(message)]
        pub fn function_address(&self) -> AccountId {
            self.employee_function.clone().unwrap().account_id()
        }

        #[ink(message)]
        pub fn create_project(&mut self, project_id: ProjectId) -> Result<(), ProjectError> {
            // todo: check role

            match self.employee_project.get(project_id) {
                Some(_) => return Err(ProjectError::Custom(String::from("Project already exists"))),
                None => (),
            };

            let project_code = String::from("P");
            //todo: concat project_id

            let salt = Self::env().block_number().to_le_bytes();
            let project = RmrkAssignmentRef::new(
                Vec::from(project_id.to_be_bytes()),
                project_code,
                String::from("http://hello.world"),
                100,
                String::from("ipfs://over.there"),
                Self::env().caller(),
            )
            .endowment(0)
            .code_hash(self.assignment_hash)
            .salt_bytes(salt)
            .instantiate();
            
            self.employee_project.insert(project_id, &project);

            Ok(())
        }


        #[ink(message)]
        pub fn project_collection(&self, project_id: ProjectId) -> Result<AccountId, ProjectError> {
            let employee_project = match self.employee_project.get(project_id) {
                Some(ep) => ep,
                None => return Err(ProjectError::Custom(String::from("Project does not exist"))),
            };
            
            Ok(employee_project.account_id())
        }
    

        #[ink(message)]
        pub fn gen_title_id(&self, title: String) -> Result<u32, ProjectError> {
            let mut output = <Sha2x256 as HashOutput>::Type::default(); // 256-bit buffer
            ink::env::hash_bytes::<Sha2x256>(&title, &mut output);
            Ok(u32::from_ne_bytes([output[0], output[1], output[2], output[3]]))
        }

        /// Create new proposal for give ProjectID (can only be called by 
        /// project token holder)
        #[ink(message)]
        pub fn create_proposal(&mut self, project_id: ProjectId, proposal_id: ProposalId, internal: bool) -> Result<(),ProjectError> {
            //TODO: check caller holds NFT
            if self.proposals.get(&(project_id, proposal_id)).is_some() {
                return Err(ProjectError::Custom(String::from("Proposal already exists")));
            }

            let proposal = ProposalCore {
                vote_start: self.env().block_timestamp() as u32 + self.voting_delay,
                vote_end:   self.env().block_timestamp() as u32 + self.voting_delay + self.voting_period,
                canceled: false,
                internal,
            };

            self.proposals.insert((project_id, proposal_id), &proposal);

            Ok(())
        } 

        /// List all open proposals for given project 
        #[ink(message)]
        pub fn list_proposal_ids(&self, project_id: ProjectId, ) -> Result<Vec<ProposalId>, ProjectError> {
            match self.proposal_ids.get(&project_id) {
                Some(pis) => Ok(pis),
                None => Err(ProjectError::Custom(String::from("Project does not exist")))
            }
        
        }

        #[ink(message)]
        pub fn proposal_details(&self, project_id: ProjectId, proposal_id: ProposalId) -> Result<ProposalCore, ProjectError> {
            match self.proposals.get((project_id, proposal_id)) {
                Some(pc) => Ok(pc),
                None => Err(ProjectError::Custom(String::from("Project / Proposal does not exist")))
            }
        }

        /// vote for given proposal Id
        #[ink(message)]
        pub fn vote(&mut self, vote_type: VoteType, project_id: ProjectId,  proposal_id: ProposalId) -> Result<(), ProjectError> {
            // todo: check caller has the required rights

            let caller = self.env().caller();
            //TODO: check caller holds NFT

            if !self.proposals.contains((project_id, proposal_id)) {
                return Err(ProjectError::Custom(String::from("Project / Proposal does not exist")));
            }

            if self.proposal_state(project_id, proposal_id)? != ProposalState::Active {
                return Err(ProjectError::Custom(String::from("Project / Proposal not open for voting")));
            }

            let mut vote_status = self.votes.get((project_id, proposal_id)).unwrap();
            if vote_status.has_voted.contains(&caller) {
                return Err(ProjectError::Custom(String::from("Caller has already voted")));
            }

            let voting_power = self.get_caller_voting_power();
            match vote_type {
                VoteType::Against => vote_status.votes_against += voting_power,
                VoteType::For     => vote_status.votes_for     += voting_power,
                VoteType::Abstain => vote_status.votes_abstain += voting_power,
            };

            vote_status.has_voted.push(caller);
            self.votes.insert((project_id, proposal_id), &vote_status);

            // self._emit_vote_cast(caller,proposal_id,vote);
            Ok(())
        }

        /// Current state of proposal
        #[ink(message)]
        pub fn proposal_state(&mut self, project_id: ProjectId, proposal_id: ProposalId) -> Result<ProposalState, ProjectError> {
            assert!(self.proposals.contains((project_id, proposal_id)), "Proposal does noet exist");
            let proposal = self.proposals.get((project_id, proposal_id)).unwrap();

            if proposal.canceled {
                return Ok(ProposalState::Canceled);
            }

            if proposal.vote_start > self.env().block_timestamp() as u32 {
                return Ok(ProposalState::Pending);
            }

            if proposal.vote_end > self.env().block_timestamp() as u32 {
                return Ok(ProposalState::Active);
            }

            let vote = self.votes.get((project_id, proposal_id)).unwrap();
            if vote.votes_for > vote.votes_against {
                return Ok(ProposalState::Succeeded);
            }

            return Ok(ProposalState::Defeated);
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

        fn get_caller_voting_power(&self) -> u32 {
            // TODO: Implement PRJ voting factor  * FNC voting factor but not sure where to get these values from
            return 1;
        }

        // #[ink(message)]
        // pub fn mint_employee(&mut self, to: AccountId) -> Result<(), ProjectError> {
        //     //self.employee.unwrap().mint(to);
        //     //RmrkEmployeeRef::mint(to);
        // }
    }
}