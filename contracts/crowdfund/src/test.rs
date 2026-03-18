#![cfg(test)]
extern crate std;

use soroban_sdk::{testutils::Address as _, Address, Env, String};
use soroban_token_contract::contract::{Token, TokenClient};
use crate::{Crowdfund, CrowdfundClient};

#[test]
fn test_crowdfund() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    // Register token
    let token_id = e.register_contract(None, Token {});
    let token_client = TokenClient::new(&e, &token_id);
    token_client.initialize(&admin, &7, &String::from_str(&e, "Test"), &String::from_str(&e, "TST"));

    // Mint tokens to users
    token_client.mint(&user1, &1000);
    token_client.mint(&user2, &1000);

    // Register crowdfund
    let crowdfund_id = e.register_contract(None, Crowdfund {});
    let crowdfund_client = CrowdfundClient::new(&e, &crowdfund_id);

    // Initialize crowdfund with a target of 1500
    crowdfund_client.initialize(&admin, &token_id, &1500);

    // User 1 deposits 1000
    crowdfund_client.deposit(&user1, &1000);
    assert_eq!(token_client.balance(&user1), 0);
    assert_eq!(token_client.balance(&crowdfund_id), 1000);

    // User 2 deposits 500
    crowdfund_client.deposit(&user2, &500);
    assert_eq!(token_client.balance(&user2), 500);
    assert_eq!(token_client.balance(&crowdfund_id), 1500);

    // State should be success since target is 1500 -> withdraw
    crowdfund_client.withdraw();

    // Admin should have 1500 tokens
    assert_eq!(token_client.balance(&admin), 1500);
    assert_eq!(token_client.balance(&crowdfund_id), 0);
}
