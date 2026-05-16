#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

mod errors;
mod instructions;
mod state;
use instructions::*;

declare_id!("J54mqgR4471bW9d4cvr3QVRfCcDXJ2Eyuf71hxrp74fJ");

#[program]
mod day_2 {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>, a: u64, b: u64, message: String<64>) -> Result<(), ProgramError> {
        ctx.accounts.initialize(a, b, message)
    }

    #[instruction(discriminator = 1)]
    pub fn array(ctx: Ctx<Initialize>, arr: Vec<PodU64, 10>) -> Result<(), ProgramError> {
        ctx.accounts.array(arr)
    }

    #[instruction(discriminator = 2)]
    pub fn underflow(ctx: Ctx<Initialize>, a: u64, b: u64) -> Result<(), ProgramError> {
        ctx.accounts.underflow(a, b)
    }
}
