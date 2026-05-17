#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;
use solana_program_log::Logger;

declare_id!("CfYnsGPuHbg31z4AsbKrxH5uo42DqaA6yj1pcFaaLgoK");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

#[derive(Accounts)]
pub struct LimitRange{}

#[error_code]
pub enum MyError {
    ///a is too big
    AIsTooBig = 6000,
    ///a is too small
    AIsTooSmall,
    ///Always errors
    AlwaysErrors,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        Ok(())
    }
}

#[program]
mod day_4 {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }

    #[instruction(discriminator = 1)]
    pub fn limit_range(ctx: Ctx<LimitRange>, a:u64) -> Result<(), ProgramError>{
        if a <10 {
            return Err(MyError::AIsTooSmall.into());
        }
        if a > 100 {
            return Err(MyError::AIsTooBig.into());
        }
        let mut logger = Logger::<64>::default();
        logger.append("Result = ");
        logger.append(a);
        logger.log();
        Ok(())
    }

    #[instruction(discriminator = 2)]
    pub fn func(ctx: Ctx<LimitRange>) -> Result<(), ProgramError>{
        log("will this print?");
        return Err(MyError::AlwaysErrors.into())
    }
}
