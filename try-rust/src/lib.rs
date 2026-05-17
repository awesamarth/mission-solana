#![cfg_attr(not(test), no_std)]

use core::hash::{BuildHasher, Hasher};
use hashbrown::HashMap;
use solana_program_log::Logger;
use quasar_lang::prelude::*;

declare_id!("AE5LFjhxwzTG4yZjathhtdGe6iR7PGcZMFP3TSgryMuz");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

#[derive(Clone, Copy, Default)]
struct SimpleBuildHasher;

struct SimpleHasher(u64);

impl BuildHasher for SimpleBuildHasher {
    type Hasher = SimpleHasher;

    fn build_hasher(&self) -> Self::Hasher {
        SimpleHasher(0xcbf29ce484222325)
    }
}

impl Hasher for SimpleHasher {
    fn finish(&self) -> u64 {
        self.0
    }

    fn write(&mut self, bytes: &[u8]) {
        for byte in bytes {
            self.0 ^= u64::from(*byte);
            self.0 = self.0.wrapping_mul(0x100000001b3);
        }
    }
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self, key:&str, value:&str) -> Result<(), ProgramError> {
        let mut my_map: HashMap<&str, &str, SimpleBuildHasher> =
            HashMap::with_hasher(SimpleBuildHasher);
        my_map.insert(key, value);

        let mut logger = Logger::<128>::default();
        logger.append("My name is ");
        logger.append(my_map[key]);
        logger.log();
        Ok(())
    }
}

#[program]
mod try_rust {
    use super::*;

    #[instruction(discriminator = 0, heap)]
    pub fn initialize(ctx: Ctx<Initialize>, key: String<64>, value:String<64>) -> Result<(), ProgramError> {
        ctx.accounts.initialize(key, value)
    }

    #[instruction(discriminator = 1)]
    pub fn age_checker(ctx: Ctx<Initialize>, age:u64) -> Result<(), ProgramError>{
        if age >= 18{
            log("you are an adult");
        }
        else {
            log("no beer for you");
        }
        Ok(())
    }

    #[instruction(discriminator = 2)]
    pub fn filter_evens(ctx: Ctx<Initialize>, nums:Vec<PodU64, 16>) -> Result<(), ProgramError>{
        let mut logger = Logger::<128>::default();
        logger.append("evens:");

        for num in nums {
            let value = u64::from(*num);
            if value %2 ==0 {
                logger.append(" ");
                logger.append(value);
            }
        }
        logger.log();
        Ok(())
    }
}
