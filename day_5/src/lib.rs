#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("BQ8YvDZa5D79iBJCqNEi4hMzWeoJc3Yq9zPHmcW9wdw5");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        log("Instruction initialize");
        Ok(())
    }
}

#[program]
mod day_5 {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
