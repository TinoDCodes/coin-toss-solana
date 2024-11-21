use anchor_lang::prelude::*;

declare_id!("AotF3uCcqR7LymaLUproQ3PwmqFqoK7zwg1t7FfU4rb8");

#[program]
pub mod coin_toss {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
