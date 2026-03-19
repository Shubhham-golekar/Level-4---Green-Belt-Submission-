#![allow(non_snake_case)]

use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    pub decimal: u32,
    pub name: String,
    pub symbol: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    // Crowdfund Keys
    Admin,
    TargetAmount,
    TotalAmount,
    State,
    CrowdfundBalance(Address), // Internal tracking of deposits
    
    // Token Keys
    TokenMetadata,
    TokenAdmin,
    Allowance(AllowanceDataKey),
    Balance(Address), // General token balance
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AllowanceDataKey {
    pub from: Address,
    pub spender: Address,
}
