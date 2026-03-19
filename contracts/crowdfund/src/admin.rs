use soroban_sdk::{Env, Address};
use crate::storage_types::DataKey;

// Separate admin checks for general contract and token

pub fn has_admin(e: &Env) -> bool {
    let key = DataKey::Admin;
    e.storage().instance().has(&key)
}

pub fn read_admin(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_admin(e: &Env, admin: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, admin);
}

pub fn has_token_admin(e: &Env) -> bool {
    let key = DataKey::TokenAdmin;
    e.storage().instance().has(&key)
}

pub fn read_token_admin(e: &Env) -> Address {
    let key = DataKey::TokenAdmin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_token_admin(e: &Env, admin: &Address) {
    let key = DataKey::TokenAdmin;
    e.storage().instance().set(&key, admin);
}
