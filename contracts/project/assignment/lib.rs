#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

pub use self::rmrk_assignment::{
        RmrkAssignment,
        RmrkAssignmentRef,
};


#[openbrush::contract]
pub mod rmrk_assignment { // from rmrk_example_mintable
    use ink::codegen::{
        EmitEvent,
        Env,
    };

    use openbrush::{
        contracts::{
            access_control::*,
            psp34::extensions::{
                enumerable::*,
                metadata::*,
            },
            reentrancy_guard::*,
        },
        traits::{
            Storage,
            String,
        },
    };

    use rmrk::{
        config,
        query::*,
        storage::*,
        traits::*,
    };

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: Id,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        approved: bool,
    }

    // RmrkAssignment contract storage
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct RmrkAssignment {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        guard: reentrancy_guard::Data,
        #[storage_field]
        access: access_control::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        minting: MintingData,
    }

    impl PSP34 for RmrkAssignment {}

    impl AccessControl for RmrkAssignment {}

    impl PSP34Metadata for RmrkAssignment {}

    impl PSP34Enumerable for RmrkAssignment {}

    impl Minting for RmrkAssignment {}

    impl Query for RmrkAssignment {}

    impl RmrkAssignment {
        /// Instantiate new RMRK contract
        #[allow(clippy::too_many_arguments)]
        #[ink(constructor)]
        pub fn new(
            name: String,
            symbol: String,
            base_uri: String,
            max_supply: u64,
            collection_metadata: String,
            admin: AccountId,
        ) -> Self {
            let mut instance = RmrkAssignment::default();
            config::with_admin(&mut instance, admin);
            config::with_contributor(&mut instance, Self::env().caller());
            config::with_collection(
                &mut instance,
                name,
                symbol,
                base_uri,
                collection_metadata,
                max_supply,
            );
            instance
        }

        #[ink(message)]
        pub fn account_id(&self) -> AccountId {
            self.env().account_id()
        }
    }

    impl psp34::Internal for RmrkAssignment {
        /// Emit Transfer event
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(Transfer { from, to, id });
        }

        /// Emit Approval event
        fn _emit_approval_event(
            &self,
            from: AccountId,
            to: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(Approval {
                from,
                to,
                id,
                approved,
            });
        }
    }
}
