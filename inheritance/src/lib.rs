#![cfg_attr(not(test), no_std)]

use quasar_lang::{log, prelude::*};
use solana_program_log::Logger;

declare_id!("HvM3N4kCYNmtJ3a8aaAuShLDZRqnsScwB7F3Rs3VR1QX");

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self) -> Result<(), ProgramError> {
        let u = get_a_num();
        let mut logger = Logger::<64>::default();

        logger.append("u= ");
        logger.append(u);
        logger.log();
        Ok(())
    }
}

fn get_a_num() -> u64 {
    2
}

#[program]
pub mod inheritance {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        some_internal_function::internal_function();
        some_function_function::private_function();

        ctx.accounts.initialize()
    }

    pub mod some_internal_function {
        pub fn internal_function() {
            // Internal function logic...
        }
    }

    pub mod some_function_function {
        pub(in crate::inheritance) fn private_function() {
            // Private function logic...
        }
    }

}

mod do_something {
    // Import func_visibility module
    use crate::inheritance;

    pub fn some_func_here() {
        // Call the internal_function from outside its parent module
        inheritance::some_internal_function::internal_function();

        // Do something else...
    }
}

