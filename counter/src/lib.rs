#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

declare_id!("7CunnzzsfdWMokkzwwGciNY4FQ78N59EjZ3Bx3RRp4vz");



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
pub struct Set {
    #[account(mut, address = MyStorage::seeds())]
    pub my_storage: Account<MyStorage>,
}

impl Set {
    #[inline(always)]
    pub fn set(&mut self, new_x: i64, new_y:i64, new_z:i64) -> Result<(), ProgramError> {
        let storage = &mut self.my_storage;
        storage.x = new_x.into();
        storage.y= new_y.into();
        storage.z = new_z.into();
        Ok(())
    }
}

#[program]
mod counter {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize()
    }

    #[instruction(discriminator = 1)]
    pub fn set(ctx: Ctx<Set>, new_x: i64, new_y:i64, new_z:i64) -> Result<(), ProgramError> {
        ctx.accounts.set(new_x, new_y, new_z)
    }
}


#[account(discriminator = 1)]
#[seeds(b"")]
pub struct MyStorage {
    pub x: i64,
    pub y:i64,
    pub z:i64
}
