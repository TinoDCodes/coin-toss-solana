use anchor_lang::prelude::*;

declare_id!("HkNH3gcjC2cJyakVjP9bzehRGKvYT3qLwXWtSuZQrVo3");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
