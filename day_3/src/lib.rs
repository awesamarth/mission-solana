#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;
use solana_program_log::Logger;

declare_id!("9LDhvYsdua2nrBhD6uu2D1MEfXQQ8BPCoSP92vhdPfAG");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn boaty_mc_boatface(&self) -> Result<(), ProgramError> {
        Ok(())
    }

    #[inline(always)]
    pub fn add (&self, a:u64, b:u64) -> Result<(), ProgramError>{
        let result = a + b;
        log("added numbers");
        let mut logger = Logger::<64>::default();
        logger.append("result: ");
        logger.append(result);
        logger.log();
        Ok(())
    }
}

#[program]
mod day_3 {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.boaty_mc_boatface()
    }

    #[instruction(discriminator =1)]
    pub fn add (ctx: Ctx<Initialize>, a:u64, b:u64) -> Result<(), ProgramError>{
        ctx.accounts.add(a,b)
    }
}
