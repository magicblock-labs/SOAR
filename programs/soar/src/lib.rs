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

    /// Initialize a new [Game] and register its [LeaderBoard].
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        game_meta: GameMeta,
        game_auth: Vec<Pubkey>,
        lb_input: RegisterLeaderBoardInput,
    ) -> Result<()> {
        create_game::handler(ctx, game_meta, game_auth, lb_input)
    }

    /// Update a [Game]'s meta-information or authority list.
    pub fn update_game(
        ctx: Context<UpdateGame>,
        new_meta: Option<GameMeta>,
        new_auth: Option<Vec<Pubkey>>,
    ) -> Result<()> {
        update_game::handler(ctx, new_meta, new_auth)
    }

    /// Add a new [Achievement] that can be attained for a particular [Game].
    pub fn add_achievement(
        ctx: Context<AddAchievement>,
        title: String,
        description: String,
        nft_meta: Pubkey,
    ) -> Result<()> {
        add_achievement::handler(ctx, title, description, nft_meta)
    }

    /// Update an [Achievement]'s meta information.
    pub fn update_achievement(
        ctx: Context<UpdateAchievement>,
        new_title: Option<String>,
        new_description: Option<String>,
        nft_meta: Option<Pubkey>,
    ) -> Result<()> {
        update_achievement::handler(ctx, new_title, new_description, nft_meta)
    }

    /// Overwrite the active [LeaderBoard] and set a newly created one.
    pub fn add_leaderboard(
        ctx: Context<AddLeaderBoard>,
        input: RegisterLeaderBoardInput,
    ) -> Result<()> {
        add_leaderboard::handler(ctx, input)
    }

    /// Create a [PlayerInfo] account for a particular user.
    pub fn create_player(
        ctx: Context<NewPlayer>,
        unique_id: u64, // u64 or String?
        username: String,
        nft_meta: Pubkey,
    ) -> Result<()> {
        create_player::handler(ctx, unique_id, username, nft_meta)
    }

    /// Update the username or nft_meta for a [PlayerInfo] account.
    pub fn update_player(
        ctx: Context<UpdatePlayer>,
        username: Option<String>,
        nft_meta: Option<Pubkey>,
    ) -> Result<()> {
        update_player::handler(ctx, username, nft_meta)
    }

    /// Register a [PlayerInfo] for a particular [Leaderboard], resulting in a newly-
    /// created [PlayerEntryList] account.
    ///
    // TODO: Is this a good idea if leaderboards can change? That would mean players
    // need to register to each newly created leaderboard. There also `must` be checks
    // that render the old leaderboards invalid.
    //
    // Alternatively, it could be better to have the connection be between the player_info
    // and the game itself. This way a player has the same player_entry_list account
    // irrespective of changes in the leaderboard. An entry could still contain a reference to
    // the leaderboard that was active when it was made.
    pub fn register_player(ctx: Context<RegisterPlayer>) -> Result<()> {
        register_player::handler(ctx)
    }

    /// Submit a score for a player and have it timestamped and added to the [PlayerEntryList]
    pub fn submit_score(ctx: Context<SubmitScore>, score: u64) -> Result<()> {
        submit_score::handler(ctx, score)
    }
}

#[derive(Accounts)]
#[instruction(meta: GameMeta, auth: Vec<Pubkey>)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = Game::size_with_auths(auth.len()),
        seeds = [seeds::GAME, meta.title.as_bytes(), creator.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(
        init,
        payer = creator,
        space = LeaderBoard::SIZE,
        seeds = [seeds::LEADER, game.key().as_ref(), 1_u64.to_le_bytes().as_ref()],
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
    /// TODO: Close previous leaderboard account?
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
    game.leaderboard.checked_add(1).unwrap()
}

#[derive(Accounts)]
#[instruction(i: u64, username: String, p: Pubkey)]
pub struct NewPlayer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = PlayerInfo::SIZE,
        // Todo: Leave last seed as username or use id instead?
        seeds = [seeds::PLAYER, user.key().as_ref(), username.as_bytes()],
        bump,
    )]
    pub player_info: Account<'info, PlayerInfo>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, PlayerInfo>,
    #[account(constraint = game.leaderboard == leaderboard.id)]
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        init,
        payer = user,
        space = PlayerEntryList::initial_size(),
        seeds = [seeds::ENTRY, player_info.key().as_ref(), leaderboard.key().as_ref()],
        bump
    )]
    pub new_list: Account<'info, PlayerEntryList>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlayer<'info> {
    pub user: Signer<'info>,
    #[account(mut)]
    pub player_info: Account<'info, PlayerInfo>,
}

#[derive(Accounts)]
// TODO: Optionally update rank here or use a separate ix for that.
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(constraint = game.check_signer_is_auth(&authority.key()))]
    pub authority: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, PlayerInfo>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(has_one = player_info, has_one = leaderboard)]
    pub player_entries: Account<'info, PlayerEntryList>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MergePlayerId<'info> {
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitAchievement<'info> {
    pub authority: Signer<'info>,
}
