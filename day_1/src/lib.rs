#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("Hd46uorSDypot2D2KNYj5RmNRU8zvPmBD6py4yEVMnBQ");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        Ok(())
    }
}

#[program]
mod day_1 {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        log("Hello, world");
        ctx.accounts.initialize()
    }
}
