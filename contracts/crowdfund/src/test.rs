#![cfg(test)]
extern crate std;

use soroban_sdk::{testutils::Address as _, Address, Env, String, IntoVal};
use crate::{Crowdfund, CrowdfundClient};

#[test]
fn test_crowdfund_single_contract() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    // Register single merged contract
    let contract_id = e.register_contract(None, Crowdfund {});
    let client = CrowdfundClient::new(&e, &contract_id);

    // Initialize with both crowdfund and token metadata
    client.initialize(
        &admin, 
        &1500, 
        &7, 
        &String::from_str(&e, "Test"), 
        &String::from_str(&e, "TST")
    );

    // Mint tokens to users (using the same contract as the token)
    client.mint(&user1, &1000);
    client.mint(&user2, &1000);

    // Verify initial balances
    assert_eq!(client.balance(&user1), 1000);
    assert_eq!(client.balance(&user2), 1000);

    // User 1 deposits 1000
    client.deposit(&user1, &1000);
    assert_eq!(client.balance(&user1), 0);
    assert_eq!(client.balance(&contract_id), 1000);
    assert_eq!(client.get_deposited(&user1), 1000);

    // User 2 deposits 500
    client.deposit(&user2, &500);
    assert_eq!(client.balance(&user2), 500);
    assert_eq!(client.balance(&contract_id), 1500);
    assert_eq!(client.get_deposited(&user2), 500);

    // State should be success since target is 1500
    assert_eq!(client.withdraw(), ());

    // Admin should have received the 1500 tokens from the success
    assert_eq!(client.balance(&admin), 1500);
    assert_eq!(client.balance(&contract_id), 0);
}
