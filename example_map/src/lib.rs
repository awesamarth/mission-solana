#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("3Udf9yJtbbqjWAsxcLo1bYUDsxR1RyNEMZWgXc9xr69Z");

#[derive(Accounts)]
#[instruction(key1: u64, key2:u64, key3:u64)]
pub struct Initialize {

    #[account(mut, init, payer = payer, address = Val::seeds(key1, key2, key3))]
    pub val : Account<Val>,

    #[account(mut)]
    pub payer: Signer,

    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&mut self) -> Result<(), ProgramError> {
        self.val.value = 0.into();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(key1: u64, key2:u64, key3:u64)]
pub struct Set {
    #[account(mut, address = Val::seeds(key1, key2, key3))]
    pub val: Account<Val>,
}

impl Set {
    #[inline(always)]
    pub fn set(&mut self, value: u64) -> Result<(), ProgramError> {
        self.val.value = value.into();
        Ok(())
    }
}

#[program]
mod example_map {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(
        ctx: Ctx<Initialize>,
        key1: u64,
        key2: u64,
        key3: u64,
    ) -> Result<(), ProgramError> {
        let _ = (key1, key2, key3);
        ctx.accounts.initialize()
    }

    #[instruction(discriminator = 1)]
    pub fn set(
        ctx: Ctx<Set>,
        key1: u64,
        key2: u64,
        key3: u64,
        value: u64,
    ) -> Result<(), ProgramError> {
        let _ = (key1, key2, key3);
        ctx.accounts.set(value)
    }
}

#[account(discriminator = 1)]
#[seeds(b"val", key1: u64, key2: u64, key3:u64)]
pub struct Val {
    pub value: u64,
}
