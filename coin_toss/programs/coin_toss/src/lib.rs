use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

declare_id!("AotF3uCcqR7LymaLUproQ3PwmqFqoK7zwg1t7FfU4rb8");

/*---------- global variables ---------*/
const ADMIN_PUBKEY: Pubkey = pubkey!("EuY4WgtvivwYf1MKYQU7j5VejM7cqJZ27t3YSYBjJqq7");
const MAX_BET_ID_LENGTH: usize = 25;

#[program]
pub mod coin_toss {
    use super::*;

    // ---- INITIALIZATION INSTRUCTION HANDLER
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    // ---- DEPOSIT INSTRUCTION HANDLER
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
        let _ = transfer(cpi_ctx, amount)?;

        Ok(())
    }

    // ---- WITHDRAWAL INSTRUCTION HANDLER
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
        let _ = transfer(cpi_ctx, amount);

        Ok(())
    }

    // ---- BET PLACEMENT INSTRUCTION HANDLER
    pub fn place_bet(ctx: Context<PlaceBet>, bet_id: String, stake: u64, odds: u64) -> Result<()> {
        require!(bet_id.len() <= MAX_BET_ID_LENGTH, CustomError::BetIdTooLong);

        msg!("Transfering user stake of {} tokens, into coin vault!", stake);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.coin_vault_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        let _ = transfer(cpi_ctx, stake)?;

        msg!("Bet placed successfully!");
        msg!("BetId: {}", bet_id);
        msg!("Stake: {}", stake);
        msg!("Odds: {}", odds);

        let user_bet_account = &mut ctx.accounts.user_bet_account;
        user_bet_account.user = ctx.accounts.user.key();
        user_bet_account.bet_id = bet_id;
        user_bet_account.stake = stake;
        user_bet_account.odds = odds;

        Ok(())
    }

    // ---- DELETE BET ACCOUNT INSTRUCTION HANDLER
    pub fn close_bet_account(_ctx: Context<CloseBetAccount>, _bet_id: String, user_address: Pubkey) -> Result<()> {
        msg!("Bet account for user {} closed!", user_address);

        Ok(())
    }
}

/*---------- define context structs/types ---------*/

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

#[derive(Accounts)]
#[instruction(bet_id: String)]
pub struct PlaceBet<'info> {
    // Derived PDAs
    #[account(
        init,
        seeds = [b"user-bet", user.key().as_ref(), bet_id.as_bytes()],
        bump,
        payer = user,
        space = DISCRIMINATOR + UserBetData::INIT_SPACE
    )]
    pub user_bet_account: Account<'info, UserBetData>,

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
    user: Signer<'info>,
    #[account(mut)]
    user_token_account: Account<'info, TokenAccount>,

    coin_toss_token_mint: Account<'info, Mint>,
    
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bet_id: String, user_address: Pubkey)]
pub struct CloseBetAccount<'info> {
    #[account(
        mut,
        seeds = [b"user-bet", user_address.as_ref(), bet_id.as_bytes()],
        bump,
        close = signer
    )]
    pub user_bet_account: Account<'info, UserBetData>,

    #[account(
        mut,
        address = ADMIN_PUBKEY @ CustomError::UnauthorizedUserAction
    )]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

/*---------- define account  structs/types ---------*/

#[account]
#[derive(InitSpace)]
pub struct UserBetData {
    pub user: Pubkey,
    #[max_len(25)]
    pub bet_id: String,
    pub stake: u64,
    pub odds: u64,
}

/*---------- define custom errors enum ---------*/
#[error_code]
enum CustomError {
    #[msg("The provided Bet Id is too long!")]
    BetIdTooLong,
    #[msg("Not authorised to perform this action!")]
    UnauthorizedUserAction
}

const DISCRIMINATOR: usize = 8;