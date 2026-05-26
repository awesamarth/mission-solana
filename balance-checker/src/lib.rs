#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;
use solana_program_log::Logger;


declare_id!("FZp19NZFKKoBATgYZFNeoN4dx5YUUsUEw8tAAvpjdGpW");

#[derive(Accounts)]
pub struct ReadBalance {
    pub acct: UncheckedAccount,
}

impl ReadBalance {
    #[inline(always)]
    pub fn read_balance(&self) -> Result<(), ProgramError> {
        let balance = self.acct.to_account_view().lamports();

        let mut logger = Logger::<64>::default();
        logger.append("balance in lamports is ");
        logger.append(balance);
        logger.log();


        Ok(())
    }
}

#[program]
mod balance_checker {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn read_balance(ctx: Ctx<ReadBalance>) -> Result<(), ProgramError> {
        ctx.accounts.read_balance()
    }
}
