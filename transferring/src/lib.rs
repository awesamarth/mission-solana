#![cfg_attr(not(test), no_std)]

use quasar_lang::{prelude::*, remaining::RemainingAccounts};

declare_id!("95gDYtkaZQ9C3yhiAN3GLGr6KSjWZuZDsssY7jJYN4QC");

#[derive(Accounts)]
pub struct SendSol {
    #[account(mut)]
    pub recipient: UncheckedAccount,

    #[account(mut)]
    pub signer : Signer,
    pub system_program: Program<SystemProgram>,
}

#[derive(Accounts)]
pub struct SplitSol {
    #[account(mut)]
    pub signer: Signer,

    pub system_program: Program<SystemProgram>,
}

impl SendSol {
    #[inline(always)]
    pub fn send_sol(&self, amount: u64) -> Result<(), ProgramError> {
        self.system_program
            .transfer(&self.signer, &self.recipient, amount)
            .invoke()
    }
}

impl SplitSol {
    #[inline(always)]
    pub fn split_sol(
        &self,
        amount: u64,
        recipients: RemainingAccounts<'_>,
    ) -> Result<(), ProgramError> {
        if recipients.is_empty() {
            return Err(ProgramError::NotEnoughAccountKeys);
        }

        let mut recipient_count = 0u64;
        for recipient in recipients.iter() {
            let _ = recipient?;
            recipient_count += 1;
        }
        let amount_each_gets = amount / recipient_count;

        for recipient in recipients.iter() {
            let recipient = recipient?;
            if !recipient.is_writable() {
                return Err(ProgramError::InvalidArgument);
            }
            self.system_program
                .transfer(
                    &self.signer,
                    unsafe { recipient.as_account_view_unchecked() },
                    amount_each_gets,
                )
                .invoke()?;
        }

        Ok(())
    }
}

#[program]
mod transferring {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn send_sol(ctx: Ctx<SendSol>, amount:u64) -> Result<(), ProgramError> {
        ctx.accounts.send_sol(amount)
    }

    #[instruction(discriminator = 1)]
    pub fn split_sol(
        ctx: CtxWithRemaining<SplitSol>,
        amount: u64,
    ) -> Result<(), ProgramError> {
        ctx.accounts.split_sol(amount, ctx.remaining_accounts())
    }
}
