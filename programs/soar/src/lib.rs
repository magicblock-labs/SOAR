#![allow(clippy::result_large_err)]
#![allow(dead_code)]

use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

mod error;
mod instructions;
mod seeds;
mod state;
mod utils;

use error::CrateError;
use instructions::*;
use state::*;

#[program]
pub mod soar {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        id: String,
        game_meta: GameMeta,
        game_auth: Vec<Pubkey>,
        lb_input: RegisterLeaderBoardInput,
    ) -> Result<()> {
        initialize_game::handler(ctx, id, game_meta, game_auth, lb_input)
    }

    pub fn update_game(
        ctx: Context<UpdateGame>,
        new_meta: Option<GameMeta>,
        new_auth: Option<Vec<Pubkey>>,
    ) -> Result<()> {
        update_game::handler(ctx, new_meta, new_auth)
    }

    pub fn add_achievement(
        ctx: Context<AddAchievement>,
        title: String,
        description: String,
        nft_meta: Pubkey,
    ) -> Result<()> {
        add_achievement::handler(ctx, title, description, nft_meta)
    }

    pub fn update_achievement(
        ctx: Context<UpdateAchievement>,
        new_title: Option<String>,
        new_description: Option<String>,
        nft_meta: Option<Pubkey>,
    ) -> Result<()> {
        update_achievement::handler(ctx, new_title, new_description, nft_meta)
    }

    pub fn add_leaderboard(
        ctx: Context<AddLeaderBoard>,
        input: RegisterLeaderBoardInput,
    ) -> Result<()> {
        add_leaderboard::handler(ctx, input)
    }

    pub fn register_player(
        ctx: Context<RegisterPlayer>,
        id: u64,
        username: String,
        nft_meta: Pubkey,
    ) -> Result<()> {
        register_player::handler(ctx, id, username, nft_meta)
    }
}

#[derive(Accounts)]
#[instruction(game_id: String, auth: Vec<Pubkey>, meta: GameMeta)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = Game::calculate_size(auth.len()),
        seeds = [seeds::GAME, game_id.as_bytes(), creator.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        init,
        payer = creator,
        space = LeaderBoard::SIZE,
        seeds = [seeds::LEADER, game.key().as_ref(), 0_u64.to_le_bytes().as_ref()],
        bump
    )]
    pub leaderboard: Account<'info, LeaderBoard>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGame<'info> {
    #[account(
        constraint = game.check_signer_is_auth(authority.key)
        @ CrateError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct AddAchievement<'info> {
    #[account(
        mut,
        constraint = game.check_signer_is_auth(authority.key)
        @ CrateError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(
        init,
        payer = payer,
        space = Achievement::SIZE,
        // Todo: last seed okay as title or to use incrementing index?
        seeds = [seeds::ACHIEVEMENT, game.key().as_ref(), title.as_bytes()],
        bump,
    )]
    pub new_achievement: Account<'info, Achievement>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAchievement<'info> {
    #[account(
        mut,
        constraint = game.check_signer_is_auth(authority.key)
        @ CrateError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(mut, has_one = game)]
    pub achievement: Account<'info, Achievement>,
}

#[derive(Accounts)]
pub struct AddLeaderBoard<'info> {
    #[account(
        mut,
        constraint = game.check_signer_is_auth(authority.key)
        @ CrateError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(
        init,
        payer = payer,
        space = LeaderBoard::SIZE,
        // last seed okay as title or to use incrementing index?
        seeds = [seeds::LEADER, game.key().as_ref(), &next_leaderboard_id(&game).to_le_bytes()],
        bump,
    )]
    pub leaderboard: Account<'info, LeaderBoard>,
    pub system_program: Program<'info, System>,
}

fn next_leaderboard_id(game: &Account<'_, Game>) -> u64 {
    game.current_leaderboard.checked_add(1).unwrap()
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct RegisterPlayer<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        init,
        payer = player,
        space = PlayerInfo::SIZE,
        // Todo: Leave last seed as username or use id instead?
        seeds = [seeds::PLAYER, player.key().as_ref(), username.as_bytes()],
        bump,
    )]
    pub player_account: Account<'info, PlayerInfo>,
    pub system_program: Program<'info, System>,
}
