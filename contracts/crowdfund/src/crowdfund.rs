use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};
use crate::storage_types::{DataKey, TokenMetadata};
use crate::admin::{read_admin, write_admin, write_token_admin, read_token_admin};
use crate::balance::{read_balance, receive_balance, spend_balance};
use crate::allowance::{write_allowance, spend_allowance};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[contracttype]
pub enum State {
    Running,
    Success,
    Expired,
}

#[contract]
pub struct Crowdfund;

#[contractimpl]
impl Crowdfund {
    pub fn initialize(
        e: Env,
        admin: Address,
        target_amount: i128,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        // Crowdfund setup
        write_admin(&e, &admin);
        e.storage().instance().set(&DataKey::TargetAmount, &target_amount);
        e.storage().instance().set(&DataKey::TotalAmount, &0i128);
        e.storage().instance().set(&DataKey::State, &State::Running);

        // Token setup
        write_token_admin(&e, &admin);
        let metadata = TokenMetadata { decimal, name, symbol };
        e.storage().instance().set(&DataKey::TokenMetadata, &metadata);
    }

    // --- Crowdfund Logic ---

    pub fn deposit(e: Env, from: Address, amount: i128) {
        let state: State = e.storage().instance().get(&DataKey::State).unwrap();
        if state != State::Running {
            panic!("campaign is not running");
        }
        if amount <= 0 {
            panic!("amount must be positive");
        }

        from.require_auth();

        // INTERNAL TOKEN TRANSFER: Transfer from depositor to the contract itself
        spend_balance(&e, from.clone(), amount);
        receive_balance(&e, e.current_contract_address(), amount);

        // Update total raised
        let mut total_amount: i128 = e.storage().instance().get(&DataKey::TotalAmount).unwrap();
        total_amount += amount;
        e.storage().instance().set(&DataKey::TotalAmount, &total_amount);

        // Update internal tracking of user deposits
        let balance_key = DataKey::CrowdfundBalance(from.clone());
        let mut user_deposited: i128 = e.storage().instance().get(&balance_key).unwrap_or(0);
        user_deposited += amount;
        e.storage().instance().set(&balance_key, &user_deposited);

        // Check for success
        let target_amount: i128 = e.storage().instance().get(&DataKey::TargetAmount).unwrap();
        if total_amount >= target_amount {
            e.storage().instance().set(&DataKey::State, &State::Success);
        }
    }

    pub fn withdraw(e: Env) {
        let state: State = e.storage().instance().get(&DataKey::State).unwrap();
        if state != State::Success {
            panic!("campaign not successful yet");
        }

        let admin = read_admin(&e);
        admin.require_auth();

        let total_amount: i128 = e.storage().instance().get(&DataKey::TotalAmount).unwrap();

        // INTERNAL TOKEN TRANSFER: Contract to Admin
        spend_balance(&e, e.current_contract_address(), total_amount);
        receive_balance(&e, admin, total_amount);

        // Reset total to prevent double withdrawal
        e.storage().instance().set(&DataKey::TotalAmount, &0i128);
    }

    pub fn refund(e: Env, to: Address) {
        let state: State = e.storage().instance().get(&DataKey::State).unwrap();
        if state != State::Expired {
            panic!("campaign not expired");
        }

        to.require_auth();

        let balance_key = DataKey::CrowdfundBalance(to.clone());
        let user_deposited: i128 = e.storage().instance().get(&balance_key).unwrap_or(0);

        if user_deposited == 0 {
            panic!("no balance to refund");
        }

        // INTERNAL TOKEN TRANSFER: Contract back to user
        spend_balance(&e, e.current_contract_address(), user_deposited);
        receive_balance(&e, to.clone(), user_deposited);

        // Reset user tracking
        e.storage().instance().set(&balance_key, &0i128);
    }

    pub fn expire(e: Env) {
        let admin = read_admin(&e);
        admin.require_auth();
        e.storage().instance().set(&DataKey::State, &State::Expired);
    }

    // --- Token Logic (Traditional Token Methods) ---

    pub fn mint(e: Env, to: Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }
        let admin = read_token_admin(&e);
        admin.require_auth();
        receive_balance(&e, to, amount);
    }

    pub fn approve(e: Env, from: Address, spender: Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }
        from.require_auth();
        write_allowance(&e, from, spender, amount);
    }

    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }
        from.require_auth();
        spend_balance(&e, from, amount);
        receive_balance(&e, to, amount);
    }

    pub fn transfer_from(e: Env, spender: Address, from: Address, to: Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }
        spender.require_auth();
        spend_allowance(&e, from.clone(), spender, amount);
        spend_balance(&e, from, amount);
        receive_balance(&e, to, amount);
    }

    pub fn balance(e: Env, id: Address) -> i128 {
        read_balance(&e, id)
    }
    
    pub fn get_deposited(e: Env, id: Address) -> i128 {
        e.storage().instance().get(&DataKey::CrowdfundBalance(id)).unwrap_or(0)
    }

    pub fn get_state(e: Env) -> State {
        e.storage().instance().get(&DataKey::State).unwrap()
    }
}
