#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};
use crate::admin::{has_admin, read_admin, write_admin};
use crate::allowance::{read_allowance, spend_allowance, write_allowance};
use crate::balance::{read_balance, receive_balance, spend_balance};

#[contracttype]
#[derive(Clone)]
pub struct TokenMetadata {
    pub decimal: u32,
    pub name: String,
    pub symbol: String,
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    pub fn initialize(
        e: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        if has_admin(&e) {
            panic!("already initialized")
        }
        write_admin(&e, &admin);

        let metadata = TokenMetadata { decimal, name, symbol };
        e.storage().instance().set(&soroban_sdk::Symbol::new(&e, "metadata"), &metadata);
    }

    pub fn mint(e: Env, to: Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }
        let admin = read_admin(&e);
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
}
