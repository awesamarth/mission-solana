#![cfg_attr(not(test), no_std)]

use quasar_lang::{
    prelude::*,
    sysvars::{
        rent::{Rent as RentSysvar, ACCOUNT_STORAGE_OVERHEAD},
        Sysvar,
    },
};
use solana_program_log::Logger;

declare_id!("y3ZpqnVKQCV7iPaApSkH3T7RjtQ22tKsQ5kRMSCjtpH");

#[derive(Accounts)]
pub struct Initialize {
    #[account(mut, init, payer = payer, address = MyStorage::seeds())]
    pub my_storage: Account<MyStorage>,

    #[account(mut)]
    pub payer: Signer,

    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&mut self) -> Result<(), ProgramError> {
        self.my_storage.x = 0.into();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct LogRentCosts {}

impl LogRentCosts {
    #[inline(always)]
    pub fn log_rent_costs(&self) -> Result<(), ProgramError> {
        let rent = RentSysvar::get()?;
        let cost_of_empty_account = rent.try_minimum_balance(0)?;
        let cost_of_32_byte_account = rent.try_minimum_balance(32)?;

        let mut logger = Logger::<256>::default();
        logger.append("account storage overhead bytes: ");
        logger.append(ACCOUNT_STORAGE_OVERHEAD);
        logger.append(" lamports per byte: ");
        logger.append(rent.lamports_per_byte());
        logger.append(" ");
        logger.append("empty account rent lamports: ");
        logger.append(cost_of_empty_account);
        logger.append(" 32 byte account rent lamports: ");
        logger.append(cost_of_32_byte_account);
        logger.log();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct IncreaseAccountSize {
    #[account(mut, address = MyStorage::seeds())]
    pub my_storage: Account<MyStorage>,

    #[account(mut)]
    pub payer: Signer,

    pub system_program: Program<SystemProgram>,
}

impl IncreaseAccountSize {
    #[inline(always)]
    pub fn increase_account_size(&mut self) -> Result<(), ProgramError> {
        self.my_storage
            .realloc(MyStorage::SPACE + 1000, self.payer.to_account_view(), None)
    }
}

#[program]
mod rent {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }

    #[instruction(discriminator = 1)]
    pub fn log_rent_costs(ctx: Ctx<LogRentCosts>) -> Result<(), ProgramError> {
        ctx.accounts.log_rent_costs()
    }

    #[instruction(discriminator = 2)]
    pub fn increase_account_size(ctx: Ctx<IncreaseAccountSize>) -> Result<(), ProgramError> {
        ctx.accounts.increase_account_size()
    }
}

#[account(discriminator = 1)]
#[seeds(b"my_storage")]
pub struct MyStorage {
    pub x: u64,
}
