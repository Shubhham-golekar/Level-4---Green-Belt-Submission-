#![cfg(test)]
extern crate std;

use super::contract::{Token, TokenClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_token() {
    let e = Env::default();
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let user1 = Address::generate(&e);
    let user2 = Address::generate(&e);

    let contract_id = e.register_contract(None, Token {});
    let client = TokenClient::new(&e, &contract_id);

    client.initialize(&admin, &7, &String::from_str(&e, "Test"), &String::from_str(&e, "TST"));

    client.mint(&user1, &1000);
    assert_eq!(client.balance(&user1), 1000);

    client.transfer(&user1, &user2, &600);
    assert_eq!(client.balance(&user1), 400);
    assert_eq!(client.balance(&user2), 600);
}
