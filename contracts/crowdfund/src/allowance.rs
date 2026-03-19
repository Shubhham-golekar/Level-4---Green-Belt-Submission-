use soroban_sdk::{Env, Address};
use crate::storage_types::{DataKey, AllowanceDataKey};

pub fn read_allowance(e: &Env, from: Address, spender: Address) -> i128 {
    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    if let Some(allowance) = e.storage().temporary().get::<_, i128>(&key) {
        if allowance > 0 {
            e.storage().temporary().extend_ttl(&key, 10000, 10000);
            return allowance;
        }
    }
    0
}

pub fn write_allowance(e: &Env, from: Address, spender: Address, amount: i128) {
    let key = DataKey::Allowance(AllowanceDataKey { from, spender });
    e.storage().temporary().set(&key, &amount);
    e.storage().temporary().extend_ttl(&key, 10000, 10000);
}

pub fn spend_allowance(e: &Env, from: Address, spender: Address, amount: i128) {
    let allowance = read_allowance(e, from.clone(), spender.clone());
    if allowance < amount {
        panic!("insufficient allowance");
    }
    write_allowance(e, from, spender, allowance - amount);
}
