use soroban_sdk::{contract, contractimpl, contracttype, contractclient, Address, Env};

// Define token client interface without importing the full token contract
#[contractclient(name = "TokenClient")]
pub trait TokenInterface {
    fn transfer(env: Env, from: Address, to: Address, amount: i128);
    fn balance(env: Env, id: Address) -> i128;
}

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    TargetAmount,
    TotalAmount,
    Balance(Address),
    State,
}

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
        token: Address,
        target_amount: i128,
    ) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::TargetAmount, &target_amount);
        e.storage().instance().set(&DataKey::TotalAmount, &0i128);
        e.storage().instance().set(&DataKey::State, &State::Running);
    }

    pub fn deposit(e: Env, from: Address, amount: i128) {
        let state: State = e.storage().instance().get(&DataKey::State).unwrap();
        if state != State::Running {
            panic!("campaign is not running");
        }
        if amount <= 0 {
            panic!("amount must be positive");
        }

        from.require_auth();

        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();

        // INTER-CONTRACT CALL: Call Token Contract to transfer funds
        let token_client = TokenClient::new(&e, &token_addr);
        token_client.transfer(&from, &e.current_contract_address(), &amount);

        // Update total raised
        let mut total_amount: i128 = e.storage().instance().get(&DataKey::TotalAmount).unwrap();
        total_amount += amount;
        e.storage().instance().set(&DataKey::TotalAmount, &total_amount);

        // Update user balance
        let balance_key = DataKey::Balance(from.clone());
        let mut user_balance: i128 = e.storage().instance().get(&balance_key).unwrap_or(0);
        user_balance += amount;
        e.storage().instance().set(&balance_key, &user_balance);

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

        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let total_amount: i128 = e.storage().instance().get(&DataKey::TotalAmount).unwrap();

        // INTER-CONTRACT CALL
        let token_client = TokenClient::new(&e, &token_addr);
        token_client.transfer(&e.current_contract_address(), &admin, &total_amount);

        // Reset total to prevent double withdrawal
        e.storage().instance().set(&DataKey::TotalAmount, &0i128);
    }

    pub fn refund(e: Env, to: Address) {
        let state: State = e.storage().instance().get(&DataKey::State).unwrap();
        if state != State::Expired {
            panic!("campaign not expired");
        }

        to.require_auth();

        let balance_key = DataKey::Balance(to.clone());
        let user_balance: i128 = e.storage().instance().get(&balance_key).unwrap_or(0);

        if user_balance == 0 {
            panic!("no balance to refund");
        }

        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = TokenClient::new(&e, &token_addr);

        // INTER-CONTRACT CALL
        token_client.transfer(&e.current_contract_address(), &to, &user_balance);

        // Reset user balance
        e.storage().instance().set(&balance_key, &0i128);
    }

    pub fn expire(e: Env) {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        e.storage().instance().set(&DataKey::State, &State::Expired);
    }
}
