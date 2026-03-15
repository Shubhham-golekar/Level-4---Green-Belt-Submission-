use soroban_sdk::{Env, Address};
use crate::token::storage_types::{DataKey, AdminData};

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

pub fn check_admin(e: &Env, admin: &Address) {
    if admin != &read_admin(e) {
        panic!("not authorized by admin")
    }
}
