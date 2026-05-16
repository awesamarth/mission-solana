use quasar_lang::prelude::*;
use solana_program_log::Logger;

#[derive(Accounts)]
pub struct Initialize {
    pub payer: Signer,
    pub system_program: Program<SystemProgram>,
}

impl Initialize {
    #[inline(always)]
    pub fn initialize(&self, a: u64, b: u64, message: &str) -> Result<(), ProgramError> {
        let mut logger = Logger::<128>::default();
        logger.append("You sent ");
        logger.append(a);
        logger.append(" and ");
        logger.append(b);
        logger.append(": ");
        logger.append(message);
        logger.log();

        Ok(())
    }

    #[inline(always)]
    pub fn array(&self, arr: &[PodU64]) -> Result<(), ProgramError> {
        let mut logger = Logger::<128>::default();
        logger.append("Array length ");
        logger.append(arr.len() as u64);
        logger.log();
        Ok(())
    }

    #[inline(always)]
    pub fn underflow(&self, a: u64, b: u64) -> Result<(), ProgramError> {
        let result = a.checked_sub(b).unwrap();

        let mut logger = Logger::<128>::default();
        logger.append("Subtraction result ");
        logger.append(result);
        logger.log();

        Ok(())
    }
}
