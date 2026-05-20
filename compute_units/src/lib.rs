#![cfg_attr(not(test), no_std)]

use alloc::vec::Vec;
use quasar_lang::prelude::*;

declare_id!("F2h7cXngHJRzwhHxTxHmgvqV8t3PRSmHFsCoSovPLQS1");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        let mut a = Vec::new();
        a.push(1);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        a.push(2);
        Ok(())
    }
}

#[program]
mod compute_units {
    use super::*;

    #[instruction(discriminator = 0, heap)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
