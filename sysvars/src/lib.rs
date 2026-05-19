#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;
use quasar_lang::sysvars::Sysvar;
use solana_program_log::Logger;


declare_id!("7fA42FxBjWoiQeGd5JkHuvs3AkCV6JU5SLBCiCLYGknB");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        let clock = Clock::get()?;
        let rent = Rent::get()?;
        let mut logger = Logger::<256>::default();
        logger.append("clock slot=");
        logger.append(u64::from(clock.slot));
        logger.append(" epoch=");
        logger.append(u64::from(clock.epoch));
        logger.append(" unix_timestamp=");
        logger.append(i64::from(clock.unix_timestamp));
        logger.append(" epoch_start_timestamp=");
        logger.append(i64::from(clock.epoch_start_timestamp));
        logger.append(" leader_schedule_epoch=");
        logger.append(u64::from(clock.leader_schedule_epoch));
        logger.append(" lamports_per_byte=");
        logger.append(rent.lamports_per_byte());
        logger.append(" exemption_threshold=");
        logger.append(rent.exemption_threshold_raw());
        logger.append(" minimum_balance_100=");
        logger.append(rent.minimum_balance_unchecked(100));
        logger.log();
        Ok(())
    }
}

#[program]
mod sysvars {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }
}
