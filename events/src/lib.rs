#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("FMY5QxutnczUMRc17XNhmDcnPcQPvFaz5RXoMPqidHLq");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

#[event(discriminator = 0)]
pub struct MyEvent {
    pub value:u64,
}


impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        emit!(MyEvent {value:42});
        Ok(())
    }
}

#[program]
mod events {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
