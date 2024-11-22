use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

declare_id!("AotF3uCcqR7LymaLUproQ3PwmqFqoK7zwg1t7FfU4rb8");

#[program]
pub mod coin_toss {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn transfer_in(ctx: Context<TransferAccounts>, amount: u64) -> Result<()> {
        msg!("Depositing {} into coin vault!", amount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.coin_vault_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        );
        transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn transfer_out(ctx: Context<TransferAccounts>, amount: u64) -> Result<()> {
        msg!("Transfering tokens from vault. Amount: {}!", amount);

        let bump = ctx.bumps.token_account_owner_pda;
        let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.coin_vault_account.to_account_info(),
                to: ctx.accounts.sender_token_account.to_account_info(),
                authority: ctx.accounts.token_account_owner_pda.to_account_info(),
            },
            signer
        );
        transfer(cpi_ctx, amount);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Derived PDAs
    #[account(
        init_if_needed,
        payer = signer,
        seeds=[b"token_account_owner_pda"],
        bump,
        space = 8
    )]
    /// CHECK: This PDA is derived programmatically, and the derivation ensures its validity.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        seeds=[b"token_vault", coin_toss_token_mint.key().as_ref()],
        token::mint=coin_toss_token_mint,
        token::authority=token_account_owner_pda,
        bump
    )]
    /// CHECK: This PDA is derived programmatically, and the derivation ensures its validity.
    coin_vault_account: Account<'info, TokenAccount>,

    coin_toss_token_mint: Account<'info, Mint>,

    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferAccounts<'info> {
    // Derived PDAs
    #[account(mut,
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    /// CHECK: This PDA is derived programmatically, and the derivation ensures its validity.
    token_account_owner_pda: AccountInfo<'info>,

    #[account(mut,
        seeds=[b"token_vault", coin_toss_token_mint.key().as_ref()],
        bump,
        token::mint=coin_toss_token_mint,
        token::authority=token_account_owner_pda,
    )]
    /// CHECK: This PDA is derived programmatically, and the derivation ensures its validity.
    coin_vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    sender_token_account: Account<'info, TokenAccount>,

    coin_toss_token_mint: Account<'info, Mint>,

    #[account(mut)]
    signer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}