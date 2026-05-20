#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("yTRbBT7czDHSWhaxV6RshJ2VgXK1FXG6cLLjEhYm7NF");

#[account(discriminator = 1)]
#[seeds(b"my_storage")]
pub struct MyStorage {
    pub x: i64,
    pub y: i64,
}

#[derive(Accounts)]
pub struct Initialize {
    #[account(mut, init, payer = signer, address = MyStorage::seeds())]
    pub my_storage: Account<MyStorage>,

    #[account(mut)]
    pub signer: Signer,

    pub system_program: Program<SystemProgram>,
}


impl Initialize {
    #[inline(always)]
    pub fn initialize(&mut self) -> Result<(), ProgramError> {
        self.my_storage.x = 0.into();
        self.my_storage.y = 0.into();
        Ok(())
    }
}

#[program]
mod basic_storage {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
