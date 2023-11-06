#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use soar::cpi::accounts::{ClaimFtReward, SubmitScore};
use soar::cpi::{self};
use soar::{LeaderTopEntries, PlayerScoresList};

declare_id!("Tensgwm3DY3UJ8nhF7xnD2Wo65VcnLTXjjoyEvs6Zyk");

#[program]
mod tens {
    use super::*;

    pub fn register(
        ctx: Context<Initialize>,
        soar_state: Pubkey,
        soar_leaderboard: Pubkey,
        soar_leaderboard_top_entries: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.tens_state;

        // Prelude: We initialize the soar_game and soar_leaderboard off-chain and set
        // this program's `internal_state` as an authority so it can sign for CPIs to
        // the SOAR program.

        state.soar.state = soar_state;
        state.soar.leaderboard = soar_leaderboard;
        state.soar.top_entries = soar_leaderboard_top_entries;
        state.counter = 0;

        Ok(())
    }

    pub fn make_move(ctx: Context<MakeMove>) -> Result<()> {
        let tens = &mut ctx.accounts.tens_state;
        tens.counter = tens.counter.checked_add(1).unwrap();

        if tens.counter % 10 == 0 {
            msg!(" You won this round! ");

            let accounts = SubmitScore {
                payer: ctx.accounts.user.to_account_info(),
                authority: tens.to_account_info(),
                player_account: ctx.accounts.soar_player_account.to_account_info(),
                game: ctx.accounts.soar_state.to_account_info(),
                leaderboard: ctx.accounts.soar_leaderboard.to_account_info(),
                player_scores: ctx.accounts.soar_player_scores.to_account_info(),
                top_entries: ctx
                    .accounts
                    .soar_top_entries
                    .as_ref()
                    .map(|a| a.to_account_info()),
                system_program: ctx.accounts.system_program.to_account_info(),
            };

            let state_bump = ctx.bumps.tens_state;
            let seeds = &[b"tens".as_ref(), &[state_bump]];
            let signer = &[&seeds[..]];

            let cpi_ctx = CpiContext::new(ctx.accounts.soar_program.to_account_info(), accounts)
                .with_signer(signer);
            msg!("Submitting score {} for user.", tens.counter);
            cpi::submit_score(cpi_ctx, tens.counter)?;
        }

        Ok(())
    }

    pub fn claim_reward(ctx: Context<Claim>) -> Result<()> {
        // We claim a reward if the user's score is present in the top-entries account.
        let player = &ctx.accounts.player_account;
        let top_entries = &ctx.accounts.soar_top_entries;
        if top_entries
            .top_scores
            .iter()
            .any(|score| score.player == player.key())
            .eq(&true)
        {
            msg!("Player has a top score!..Claiming reward: ");
            let accounts = ClaimFtReward {
                user: ctx.accounts.user.to_account_info(),
                authority: ctx.accounts.tens_state.to_account_info(),
                payer: ctx.accounts.user.to_account_info(),
                game: ctx.accounts.soar_state.to_account_info(),
                achievement: ctx.accounts.soar_achievement.to_account_info(),
                reward: ctx.accounts.soar_reward.to_account_info(),
                player_account: ctx.accounts.player_account.to_account_info(),
                player_achievement: ctx.accounts.soar_player_achievement.to_account_info(),
                source_token_account: ctx.accounts.source_token_account.to_account_info(),
                user_token_account: ctx.accounts.user_token_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };

            let state_bump = ctx.bumps.tens_state;
            let seeds = &[b"tens".as_ref(), &[state_bump]];
            let signer = &[&seeds[..]];

            let cpi_ctx = CpiContext::new(ctx.accounts.soar_program.to_account_info(), accounts)
                .with_signer(signer);

            cpi::claim_ft_reward(cpi_ctx)?;
        } else {
            msg!("This user isn't eligible for a reward!");
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
        seeds = [b"tens"],
        bump,
        space = 112,
        payer = signer,
    )]
    pub tens_state: Account<'info, Tens>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"tens"], bump,
        constraint = tens_state.soar.leaderboard == soar_leaderboard.key(),
        constraint = tens_state.soar.state == soar_state.key(),
    )]
    pub tens_state: Account<'info, Tens>,
    /// CHECK: The SOAR game account for this program.
    pub soar_state: UncheckedAccount<'info>,
    /// CHECK: The SOAR leaderboard for this program.
    pub soar_leaderboard: UncheckedAccount<'info>,
    /// CHECK: The SOAR player account for this user.
    pub soar_player_account: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: The SOAR player scores account for this user.
    pub soar_player_scores: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: The SOAR top entries account for this leaderboard.
    pub soar_top_entries: Option<UncheckedAccount<'info>>,
    /// CHECK: The SOAR program ID.
    #[account(address = soar::ID)]
    pub soar_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"tens"], bump,
        constraint = tens_state.soar.state == soar_state.key(),
    )]
    pub tens_state: Account<'info, Tens>,
    /// CHECK: The SOAR player account for this user.
    #[account(mut)]
    pub player_account: UncheckedAccount<'info>,
    #[account(
        has_one = player_account,
        constraint = soar_player_scores.leaderboard == tens_state.soar.leaderboard
    )]
    pub soar_player_scores: Account<'info, PlayerScoresList>,
    #[account(constraint = tens_state.soar.top_entries == soar_top_entries.key())]
    pub soar_top_entries: Account<'info, LeaderTopEntries>,
    /// CHECK: The SOAR game for this tens program.
    pub soar_state: UncheckedAccount<'info>,
    /// CHECK: The SOAR achievement.
    pub soar_achievement: UncheckedAccount<'info>,
    /// CHECK: The SOAR reward account.
    #[account(mut)]
    pub soar_reward: UncheckedAccount<'info>,
    /// CHECK: The player-achievement account to be initialized.
    #[account(mut)]
    pub soar_player_achievement: UncheckedAccount<'info>,
    /// CHECK: The specified source account for the reward.
    #[account(mut)]
    pub source_token_account: UncheckedAccount<'info>,
    /// CHECK: The user's token account.
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,
    /// CHECK: The token program.
    pub token_program: UncheckedAccount<'info>,
    /// CHECK: The system program.
    pub system_program: UncheckedAccount<'info>,
    /// CHECK: The SOAR program.
    #[account(address = soar::ID)]
    pub soar_program: UncheckedAccount<'info>,
}

#[account]
/// A simple game.
pub struct Tens {
    /// The game counter.
    pub counter: u64,
    /// The SOAR keys for this program.
    pub soar: SoarKeysStorage,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SoarKeysStorage {
    /// The soar state for this game.
    state: Pubkey,
    /// The soar leaderboard for this game.
    leaderboard: Pubkey,
    /// The soar top-entries account for this game.
    top_entries: Pubkey,
}
