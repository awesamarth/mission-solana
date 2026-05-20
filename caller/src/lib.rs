#![cfg_attr(not(test), no_std)]

use alloc::string::ToString;
use quasar_lang::prelude::*;

declare_id!("55ssxPLYyajZZGPfUUhmtehtt6BAnwDxDVa9z1e4f4G5");

const OWNER: Address = Address::from_str_const("5yDpyuSofQARocCtzkrHaEeRjSBTuYTPPna1aeZjqUB6");

#[derive(Accounts)]
pub struct Initialize {
    pub signer1: Signer,
    pub system_program: Program<SystemProgram>,
    pub signer2: Signer,

}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        log(&self.signer1.address().to_string());
        log(&self.signer2.address().to_string());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct OnlyOwner {
    pub signer_account: Signer,
}

impl OnlyOwner {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        require_keys_eq!(
            *self.signer_account.address(),
            OWNER,
            OnlyOwnerError::NotOwner
        );

        log("Holla, I'm the owner.");
        Ok(())
    }
}

#[error_code]
pub enum OnlyOwnerError {
    /// Only owner can call this function!
    NotOwner = 6000,
}

#[program]
mod caller {
    use super::*;

    #[instruction(discriminator = 0, heap)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }

    #[instruction(discriminator = 1)]
    pub fn only_owner(ctx: Ctx<OnlyOwner>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
