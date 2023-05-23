#![allow(clippy::result_large_err)]
#![allow(dead_code)]

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("3UEaKjkjK2Lz6D4DqSEUHwtBsezL5RaNCeBSWStxyNU9");

mod error;
mod instructions;
mod seeds;
mod state;
mod utils;

use error::SoarError;
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
    ) -> Result<()> {
        create_game::handler(ctx, game_meta, game_auth)
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

    /// Update's a leaderboard's description and nft metadata information.
    pub fn update_leaderboard(
        ctx: Context<UpdateLeaderBoard>,
        new_description: Option<String>,
        new_nft_meta: Option<Pubkey>,
    ) -> Result<()> {
        update_leaderboard::handler(ctx, new_description, new_nft_meta)
    }

    /// Create a [Player] account for a particular user.
    pub fn create_player(
        ctx: Context<NewPlayer>,
        username: String,
        nft_meta: Pubkey,
    ) -> Result<()> {
        create_player::handler(ctx, username, nft_meta)
    }

    /// Update the username or nft_meta for a [Player] account.
    pub fn update_player(
        ctx: Context<UpdatePlayer>,
        username: Option<String>,
        nft_meta: Option<Pubkey>,
    ) -> Result<()> {
        update_player::handler(ctx, username, nft_meta)
    }

    /// Register a [Player] for a particular [Leaderboard], resulting in a newly-
    /// created [PlayerEntryList] account.
    pub fn register_player(ctx: Context<RegisterPlayer>) -> Result<()> {
        register_player::handler(ctx)
    }

    /// Submit a score for a player and have it timestamped and added to the [PlayerEntryList].
    /// Optionally increase the player's rank if needed.
    pub fn submit_score(ctx: Context<SubmitScore>, score: u64) -> Result<()> {
        submit_score::handler(ctx, score)
    }

    /// Initialize a new merge account and await approval from the verified users of all the
    /// specified [Player] accounts.
    pub fn initiate_merge(ctx: Context<InitiateMerge>, keys: Vec<Pubkey>) -> Result<()> {
        initiate_merge::handler(ctx, keys)
    }

    /// Register merge confirmation for a particular [Player] account included in a [Merged].
    pub fn approve_merge(ctx: Context<ApproveMerge>) -> Result<()> {
        approve_merge::handler(ctx)
    }

    /// Indicate that a player has completed some [Achievement] and create a [PlayerAchievement]
    /// as proof.
    pub fn unlock_player_achievement(ctx: Context<UnlockPlayerAchievement>) -> Result<()> {
        unlock_player_achievement::handler(ctx)
    }

    /// Optional: Add an NFT-based [Reward] for unlocking some [Achievement].
    pub fn add_reward(ctx: Context<AddReward>, input: AddNewRewardArgs) -> Result<()> {
        add_reward::handler(ctx, input)
    }

    /// Mint an NFT reward for unlocking a [PlayerAchievement] account.
    ///
    /// Optional: Only relevant if an NFT reward is specified for that achievement.
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        claim_reward::handler(ctx)
    }

    /// Verify NFT reward as belonging to a particular collection.
    ///
    /// Optional: Only relevant if an NFT reward is specified and the reward's
    /// `collection_mint` is Some(...)
    pub fn verify_reward(ctx: Context<VerifyReward>) -> Result<()> {
        verify_reward::handler(ctx)
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
        space = Game::size_with_auths(auth.len())
    )]
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGame<'info> {
    #[account(
        constraint = game.check_signer_is_authority(authority.key)
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddAchievement<'info> {
    #[account(
        constraint = game.check_signer_is_authority(authority.key)
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(
        init,
        payer = payer,
        space = Achievement::SIZE,
        seeds = [seeds::ACHIEVEMENT, game.key().as_ref(), &next_achievement(&game).to_le_bytes()],
        bump,
    )]
    pub new_achievement: Account<'info, Achievement>,
    pub system_program: Program<'info, System>,
}

fn next_achievement(game: &Account<'_, Game>) -> u64 {
    game.achievement_count.checked_add(1).unwrap()
}

#[derive(Accounts)]
pub struct UpdateAchievement<'info> {
    #[account(
        constraint = game.check_signer_is_authority(authority.key)
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(mut, has_one = game)]
    pub achievement: Account<'info, Achievement>,
}

#[derive(Accounts)]
#[instruction(input: RegisterLeaderBoardInput)]
pub struct AddLeaderBoard<'info> {
    #[account(
        constraint = game.check_signer_is_authority(authority.key)
        @ SoarError::InvalidAuthority
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
        seeds = [seeds::LEADER, game.key().as_ref(), &next_leaderboard(&game).to_le_bytes()],
        bump,
    )]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        init,
        constraint = input.scores_to_retain > 0,
        space = LeaderTopEntries::size(input.scores_to_retain as usize),
        payer = payer,
        seeds = [seeds::LEADER_TOP_ENTRIES, leaderboard.key().as_ref()],
        bump,
    )]
    pub top_entries: Option<Account<'info, LeaderTopEntries>>,
    pub system_program: Program<'info, System>,
}

fn next_leaderboard(game: &Account<'_, Game>) -> u64 {
    game.leaderboard_count.checked_add(1).unwrap()
}

#[derive(Accounts)]
pub struct UpdateLeaderBoard<'info> {
    #[account(
        constraint = game.check_signer_is_authority(authority.key)
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(mut, has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
}

#[derive(Accounts)]
pub struct NewPlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = Player::SIZE,
        seeds = [seeds::PLAYER, user.key().as_ref()],
        bump,
    )]
    pub player_info: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, Player>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        init,
        payer = payer,
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
    pub player_info: Account<'info, Player>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    pub user: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        constraint = game.check_signer_is_authority(&authority.key())
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, Player>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(mut, constraint = check_top_entries(&leaderboard, top_entries))]
    pub top_entries: Option<Account<'info, LeaderTopEntries>>,
    #[account(mut, has_one = player_info, has_one = leaderboard)]
    pub player_entries: Account<'info, PlayerEntryList>,
    pub system_program: Program<'info, System>,
}

fn check_top_entries(
    leaderboard: &Account<LeaderBoard>,
    entry: &Account<LeaderTopEntries>,
) -> bool {
    if let Some(expected) = leaderboard.top_entries {
        expected == entry.key()
    } else {
        true
    }
}

#[derive(Accounts)]
#[instruction(keys: Vec<Pubkey>)]
pub struct InitiateMerge<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player: Account<'info, Player>,
    /// CHECK: Account to be initialized in handler.
    #[account(
        init,
        payer = payer,
        space = Merged::size(dedup_input(&player.key(), keys).1)
    )]
    pub merge_account: Account<'info, Merged>,
    pub system_program: Program<'info, System>,
}

pub fn dedup_input(initiator_player_account: &Pubkey, input: Vec<Pubkey>) -> (Vec<Pubkey>, usize) {
    use std::collections::HashSet;

    let keys: Vec<Pubkey> = input
        .into_iter()
        .collect::<HashSet<_>>()
        .into_iter()
        .filter(|key| key != initiator_player_account)
        .collect();
    let size = Merged::size(keys.len());

    (keys, size)
}

#[derive(Accounts)]
pub struct ApproveMerge<'info> {
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, Player>,
    #[account(mut)]
    pub merge_account: Account<'info, Merged>,
}

#[derive(Accounts)]
pub struct UnlockPlayerAchievement<'info> {
    #[account(
        constraint = game.check_signer_is_authority(&authority.key())
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_info: Account<'info, Player>,
    // The presence of the next two accounts ensures that the player has
    // some entry for the game.
    #[account(has_one = player_info, has_one = leaderboard)]
    pub player_entry: Account<'info, PlayerEntryList>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub achievement: Account<'info, Achievement>,
    #[account(
        init,
        payer = payer,
        space = PlayerAchievement::SIZE,
        seeds = [seeds::PLAYER_ACHIEVEMENT, player_info.key().as_ref(), achievement.key().as_ref()],
        bump
    )]
    pub player_achievement: Account<'info, PlayerAchievement>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddReward<'info> {
    #[account(
        constraint = game.check_signer_is_authority(&authority.key())
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(mut, has_one = game)]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        init,
        payer = payer,
        space = Reward::SIZE,
        seeds = [seeds::REWARD, achievement.key().as_ref()],
        bump,
    )]
    pub new_reward: Box<Account<'info, Reward>>,
    pub system_program: Program<'info, System>,

    // Accounts required `ONLY` for ft reward.
    pub ft_reward_token_mint: Option<Box<Account<'info, Mint>>>,
    pub ft_reward_delegate_account: Option<Box<Account<'info, TokenAccount>>>,
    pub ft_reward_delegate_account_owner: Option<Signer<'info>>,
    pub token_program: Option<Program<'info, Token>>,

    // Accounts required `ONLY` for nft reward.
    pub nft_reward_collection_update_auth: Option<Signer<'info>>,
    pub nft_reward_collection_mint: Option<Box<Account<'info, Mint>>>,
    #[account(mut)]
    /// CHECK: Checked in instruction handler.
    pub nft_reward_collection_metadata: Option<UncheckedAccount<'info>>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: We check that the ID is the correct one.
    pub token_metadata_program: Option<UncheckedAccount<'info>>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        constraint = game.check_signer_is_authority(&authority.key())
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    /// CHECK: Checked in has_one relationship with `player`.
    pub user: UncheckedAccount<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(
        has_one = game,
        constraint = achievement.reward.unwrap() == reward.key()
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(mut, has_one = achievement)]
    pub reward: Box<Account<'info, Reward>>,
    #[account(has_one = user)]
    pub player: Box<Account<'info, Player>>,
    #[account(
        has_one = player,
        has_one = achievement,
        constraint = player_achievement.claimed == false
        @ SoarError::DuplicateRewardClaim
    )]
    pub player_achievement: Box<Account<'info, PlayerAchievement>>,
    pub token_program: Program<'info, Token>,

    // Accounts required for an achievement with an NFT RewardKind.
    #[account(mut)]
    pub payer: Option<Signer<'info>>,
    #[account(mut)]
    /// Initialized as mint in instruction.
    pub nft_reward_mint: Option<Signer<'info>>,
    #[account(mut)]
    /// CHECK: Checked in metaplex program.
    pub nft_reward_metadata: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    /// CHECK: Checked in metaplex program.
    pub nft_reward_master_edition: Option<UncheckedAccount<'info>>,
    #[account(mut)]
    /// CHECK: Initialized in handler as token account owned by `user`.
    pub nft_reward_mint_to: Option<UncheckedAccount<'info>>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: Verified Token Metadata Program address.
    pub token_metadata_program: Option<UncheckedAccount<'info>>,
    pub associated_token_program: Option<Program<'info, AssociatedToken>>,
    pub system_program: Option<Program<'info, System>>,
    pub rent: Option<Sysvar<'info, Rent>>,

    // Accounts required for an achievement with an FT RewardKind.
    #[account(mut)]
    pub source_token_account: Option<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub user_token_account: Option<Account<'info, TokenAccount>>
}

#[derive(Accounts)]
pub struct VerifyReward<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        constraint = game.check_signer_is_authority(&authority.key())
        @ SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(
        has_one = game,
        constraint = achievement.reward.unwrap() == reward.key()
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        has_one = achievement,
        seeds = [seeds::REWARD, achievement.key().as_ref()], bump,
        //constraint = reward.collection_mint == Some(collection_mint.key())
    )]
    pub reward: Box<Account<'info, Reward>>,
    /// CHECK: Checked in has_one relationship with `player`.
    pub user: UncheckedAccount<'info>,
    #[account(has_one = user)]
    pub player: Box<Account<'info, Player>>,
    #[account(
        has_one = player, has_one = achievement,
        constraint = player_achievement.nft_reward_mint.unwrap() == mint.key()
    )]
    pub player_achievement: Box<Account<'info, PlayerAchievement>>,
    /// CHECK: Checked that this is the mint in player_achievement.
    pub mint: UncheckedAccount<'info>,
    /// CHECK: Checked in handler that this is the metadata account for this mint.
    pub metadata_to_verify: UncheckedAccount<'info>,
    /// CHECK: We check that it's the reward's collection mint.
    #[account(constraint = verify_reward_collection(&reward, collection_mint.key()))]
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Checked in CPI to Metaplex.
    pub collection_metadata: UncheckedAccount<'info>,
    /// CHECK: Checked in CPI to Metaplex.
    pub collection_master_edition: UncheckedAccount<'info>,
}

fn verify_reward_collection(reward: &Reward, maybe_collection_mint: Pubkey) -> bool {
    match &reward.reward {
        RewardKind::NonFungibleToken {
            uri: _,
            name: _,
            symbol: _,
            minted: _,
            collection_mint,
        } => {
            if collection_mint.is_some() && collection_mint.unwrap() == maybe_collection_mint {
                true
            } else {
                false
            }
        }
        _ => false,
    }
}
