#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use soar::cpi::accounts::SubmitScore;
use soar::cpi::submit_score;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
mod tiny_adventure {
    use super::*;

    pub fn init_soar(
        ctx: Context<Initialize>,
        soar_game: Pubkey,
        soar_leaderboard: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.internal_state;

        // Prelude: We initialize the soar_game and soar_leaderboard off-chain and set
        // this program's `internal_state` as an authority so it can sign for CPIs to
        // the SOAR program.

        state.soar_game = soar_game;
        state.soar_leaderboard = soar_leaderboard;
        state.admin = ctx.accounts.signer.key();
        state.counter = 0;

        Ok(())
    }

    pub fn make_move(ctx: Context<MakeMove>) -> Result<()> {
        let internal = &mut ctx.accounts.internal_state;
        internal.counter = internal.counter.checked_add(1).unwrap();

        if internal.counter % 10 == 0 {
            msg!(" You won this round! ");

            let accounts = SubmitScore {
                payer: ctx.accounts.user.to_account_info(),
                authority: internal.to_account_info(),
                player_account: ctx.accounts.soar_player_account.to_account_info(),
                game: ctx.accounts.soar_game.to_account_info(),
                leaderboard: ctx.accounts.soar_leaderboard.to_account_info(),
                player_scores: ctx.accounts.soar_player_scores.to_account_info(),
                top_entries: ctx
                    .accounts
                    .soar_top_entries
                    .as_ref()
                    .map(|a| a.to_account_info()),
                system_program: ctx.accounts.system_program.to_account_info(),
            };

            let state_bump = *ctx.bumps.get("internal_state").unwrap();
            let seeds = &[b"global".as_ref(), &[state_bump]];
            let signer = &[&seeds[..]];

            let cpi_ctx = CpiContext::new(ctx.accounts.soar_program.to_account_info(), accounts)
                .with_signer(signer);
            msg!("Submitting score {} for user.", internal.counter);
            submit_score(cpi_ctx, internal.counter)?;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        seeds = [b"global"],
        bump,
        space = 112,
        payer = signer,
    )]
    pub internal_state: Account<'info, InternalState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"global"], bump,
        has_one = soar_game,
        has_one = soar_leaderboard
    )]
    pub internal_state: Account<'info, InternalState>,
    /// CHECK: The SOAR game account for this program.
    pub soar_game: UncheckedAccount<'info>,
    /// CHECK: The SOAR leaderboard for this program.
    pub soar_leaderboard: UncheckedAccount<'info>,
    /// CHECK: The SOAR player account for this user.
    pub soar_player_account: UncheckedAccount<'info>,
    /// CHECK: The SOAR player scores account for this user.
    pub soar_player_scores: UncheckedAccount<'info>,
    /// CHECK: The SOAR top entries account for this leaderboard.
    pub soar_top_entries: Option<UncheckedAccount<'info>>,
    /// CHECK: The SOAR program ID.
    #[account(address = soar::ID)]
    pub soar_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
/// A simple game.
pub struct InternalState {
    /// The soar state.
    pub soar_game: Pubkey,
    /// The currently active soar leaderboard.
    pub soar_leaderboard: Pubkey,
    pub admin: Pubkey,
    pub counter: u64,
}
