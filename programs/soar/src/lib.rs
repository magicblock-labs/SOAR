#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("SoarmxsvnGcQzLGaiue8mVTko7uuEfTY5zwdKKCnQDU");

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
        game_meta: GameAttributes,
        game_auth: Vec<Pubkey>,
    ) -> Result<()> {
        create_game::handler(ctx, game_meta, game_auth)
    }

    /// Update a [Game]'s meta-information or authority list.
    pub fn update_game(
        ctx: Context<UpdateGame>,
        new_meta: Option<GameAttributes>,
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
    pub fn initialize_player(
        ctx: Context<InitializePlayer>,
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
    ///
    /// This instruction automatically resizes the [PlayerScoresList] account if needed.
    pub fn submit_score(ctx: Context<SubmitScore>, score: u64) -> Result<()> {
        submit_score::handler(ctx, score)
    }

    /// Initialize a new merge account and await approval from the verified users of all the
    /// specified [Player] accounts.
    ///
    /// A merge is complete when all the users of the [Player] account keys referenced in it
    /// have signed to set their approval to `true`.
    pub fn initiate_merge(ctx: Context<InitiateMerge>, keys: Vec<Pubkey>) -> Result<()> {
        initiate_merge::handler(ctx, keys)
    }

    /// Register merge confirmation for a particular [Player] account included in a [Merged].
    pub fn approve_merge(ctx: Context<ApproveMerge>) -> Result<()> {
        approve_merge::handler(ctx)
    }

    /// Unlock a [PlayerAchievement] account without minting a reward.
    ///
    /// Used `ONLY` for custom rewards mechanism to setup a [PlayerAchievement] account that
    /// can serve as a gated verification-method for claims.
    ///
    /// Since claim instructions like [claim_ft_reward] and [claim_nft_reward] for reward types
    /// defined by this program try to initialize this account and will fail if it already exists,
    /// calling this means opting out of using these functions.
    pub fn unlock_player_achievement(ctx: Context<UnlockPlayerAchievement>) -> Result<()> {
        unlock_player_achievement::handler(ctx)
    }

    /// Add a fungible token [Reward] to an [Achievement] to mint to users on unlock.
    ///
    /// Overwrites the current reward if one exists.
    pub fn add_ft_reward(ctx: Context<AddFtReward>, input: AddNewRewardInput) -> Result<()> {
        add_reward::ft::handler(ctx, input)
    }

    /// Add a nft [Reward] to an [Achievement] to mint to users on unlock.
    ///
    /// Overwrites the current reward if one exists.
    pub fn add_nft_reward(ctx: Context<AddNftReward>, input: AddNewRewardInput) -> Result<()> {
        add_reward::nft::handler(ctx, input)
    }

    /// Mint an NFT reward for unlocking a [PlayerAchievement] account.
    ///
    /// This will attempt to create a [PlayerAchievement] account and fail if it already exists.
    ///
    /// Relevant `ONLY` if an FT reward is specified for that achievement.    
    pub fn claim_ft_reward(ctx: Context<ClaimFtReward>) -> Result<()> {
        claim_reward::ft::handler(ctx)
    }

    /// Mint an NFT reward for unlocking a [PlayerAchievement] account.
    ///
    /// This will attempt to create a [PlayerAchievement] account and fail if it already exists.
    ///
    /// Relevant `ONLY` if an NFT reward is specified for that achievement.
    pub fn claim_nft_reward(ctx: Context<ClaimNftReward>) -> Result<()> {
        claim_reward::nft::handler(ctx)
    }

    /// Verify NFT reward as belonging to a particular collection.
    ///
    /// Optional: Only relevant if an NFT reward is specified and the reward's
    /// `collection_mint` is Some(...)
    pub fn verify_nft_reward(ctx: Context<VerifyNftReward>) -> Result<()> {
        verify_reward::handler(ctx)
    }
}

#[derive(Accounts)]
#[instruction(_attr: GameAttributes, auth: Vec<Pubkey>)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = Game::size(auth.len())
    )]
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateGame<'info> {
    #[account(
        constraint = game.check_signer(authority.key)
        @SoarError::InvalidAuthority
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
        constraint = game.check_signer(authority.key)
        @SoarError::InvalidAuthority
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
        seeds = [
            seeds::ACHIEVEMENT,
            game.key().as_ref(),
            &game.next_achievement().to_le_bytes(),
        ],
        bump,
    )]
    pub new_achievement: Account<'info, Achievement>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAchievement<'info> {
    #[account(
        constraint = game.check_signer(authority.key)
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(
        mut,
        has_one = game
    )]
    pub achievement: Account<'info, Achievement>,
}

#[derive(Accounts)]
#[instruction(input: RegisterLeaderBoardInput)]
pub struct AddLeaderBoard<'info> {
    #[account(
        constraint = game.check_signer(authority.key)
        @SoarError::InvalidAuthority
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
        seeds = [
            seeds::LEADER, game.key().as_ref(),
            &game.next_leaderboard().to_le_bytes()
        ],
        bump,
    )]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        init,
        constraint = input.scores_to_retain > 0,
        space =
            LeaderTopEntries::size(input.scores_to_retain as usize),
        payer = payer,
        seeds = [
            seeds::LEADER_TOP_ENTRIES,
            leaderboard.key().as_ref()
        ],
        bump,
    )]
    pub top_entries: Option<Account<'info, LeaderTopEntries>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateLeaderBoard<'info> {
    #[account(
        constraint = game.check_signer(authority.key)
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub game: Account<'info, Game>,
    #[account(
        mut,
        has_one = game
    )]
    pub leaderboard: Account<'info, LeaderBoard>,
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
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
    pub player_account: Account<'info, Player>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_account: Account<'info, Player>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        init,
        payer = payer,
        space = PlayerScoresList::initial_size(),
        seeds = [
            seeds::PLAYER_SCORES,
            player_account.key().as_ref(),
            leaderboard.key().as_ref()
        ],
        bump
    )]
    pub new_list: Account<'info, PlayerScoresList>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlayer<'info> {
    pub user: Signer<'info>,
    #[account(mut)]
    pub player_account: Account<'info, Player>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        constraint = game.check_signer(&authority.key())
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    pub player_account: Account<'info, Player>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub leaderboard: Account<'info, LeaderBoard>,
    #[account(
        mut,
        has_one = player_account,
        has_one = leaderboard
    )]
    pub player_scores: Account<'info, PlayerScoresList>,
    #[account(
        mut,
        constraint =
            check_top_entries(&leaderboard, top_entries)
    )]
    pub top_entries: Option<Account<'info, LeaderTopEntries>>,
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
    pub player_account: Account<'info, Player>,
    /// CHECK: Account to be initialized in handler.
    #[account(
        init,
        payer = payer,
        space =
            Merged::size(
                dedup_input(&player_account.key(), keys).1
            )
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
    pub player_account: Account<'info, Player>,
    #[account(mut)]
    pub merge_account: Account<'info, Merged>,
}

#[derive(Accounts)]
pub struct UnlockPlayerAchievement<'info> {
    #[account(
        constraint = game.check_signer(&authority.key())
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub player_account: Account<'info, Player>,
    pub game: Account<'info, Game>,
    #[account(has_one = game)]
    pub achievement: Account<'info, Achievement>,
    #[account(
        init,
        payer = payer,
        space = PlayerAchievement::SIZE,
        seeds = [
            seeds::PLAYER_ACHIEVEMENT,
            player_account.key().as_ref(),
            achievement.key().as_ref()
        ],
        bump
    )]
    pub player_achievement: Account<'info, PlayerAchievement>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddFtReward<'info> {
    #[account(
        constraint = game.check_signer(&authority.key())
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(
        mut,
        has_one = game
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        init,
        payer = payer,
        space = Reward::SIZE,
    )]
    pub new_reward: Box<Account<'info, Reward>>,

    pub reward_token_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub delegate_from_token_account: Box<Account<'info, TokenAccount>>,
    pub token_account_owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddNftReward<'info> {
    #[account(
        constraint = game.check_signer(&authority.key())
        @SoarError::InvalidAuthority
    )]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(
        mut,
        has_one = game
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        init,
        payer = payer,
        space = Reward::SIZE,
    )]
    pub new_reward: Box<Account<'info, Reward>>,
    pub system_program: Program<'info, System>,

    pub reward_collection_mint: Option<Box<Account<'info, Mint>>>,
    pub collection_update_auth: Option<Signer<'info>>,
    #[account(mut)]
    /// CHECK: Checked in handler.
    pub collection_metadata: Option<UncheckedAccount<'info>>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: We check that the ID is the correct one.
    pub token_metadata_program: Option<UncheckedAccount<'info>>,
}

#[derive(Accounts)]
pub struct ClaimFtReward<'info> {
    /// CHECK: Checked with `player_account`
    pub user: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(constraint = game.check_signer(&authority.key()))]
    pub game: Account<'info, Game>,
    #[account(
        seeds = [
            seeds::ACHIEVEMENT,
            game.key().as_ref(),
            &achievement.id.to_le_bytes()
        ],
        bump,
        constraint = achievement.reward.is_some()
        @SoarError::NoRewardForAchievement,
        constraint = matches!(achievement.reward, Some(reward))
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        mut,
        has_one = achievement,
        constraint = reward.available_spots != 0
        @SoarError::NoAvailableRewards
    )]
    pub reward: Box<Account<'info, Reward>>,
    #[account(has_one = user)]
    pub player_account: Box<Account<'info, Player>>,
    #[account(
        init,
        payer = payer,
        space = PlayerAchievement::SIZE,
        seeds = [
            seeds::PLAYER_ACHIEVEMENT,
            player_account.key().as_ref(),
            achievement.key().as_ref()
        ],
        bump
    )]
    pub player_achievement: Box<Account<'info, PlayerAchievement>>,
    #[account(mut)]
    pub source_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimNftReward<'info> {
    /// CHECK: Checked with `player_account`
    pub user: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    #[account(constraint = game.check_signer(&authority.key()))]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [
            seeds::ACHIEVEMENT,
            game.key().as_ref(),
            &achievement.id.to_le_bytes()
        ],
        bump,
        constraint = achievement.reward.is_some()
        @SoarError::NoRewardForAchievement,
        constraint = matches!(achievement.reward, Some(reward))
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(
        mut,
        has_one = achievement,
        constraint = reward.available_spots != 0
        @SoarError::NoAvailableRewards
    )]
    pub reward: Box<Account<'info, Reward>>,
    #[account(has_one = user)]
    pub player_account: Box<Account<'info, Player>>,
    #[account(
        init,
        payer = payer,
        space = PlayerAchievement::SIZE,
        seeds = [
            seeds::PLAYER_ACHIEVEMENT,
            player_account.key().as_ref(),
            achievement.key().as_ref()
        ],
        bump
    )]
    pub player_achievement: Account<'info, PlayerAchievement>,
    #[account(
        init,
        payer = payer,
        space = NftClaim::SIZE,
        seeds = [
            seeds::NFT_CLAIM,
            reward.key().as_ref(),
            new_mint.key().as_ref()
        ],
        bump
    )]
    pub claim: Account<'info, NftClaim>,
    #[account(mut)]
    pub new_mint: Signer<'info>,
    #[account(mut)]
    /// CHECK: Checked in Metaplex CPI.
    pub new_metadata: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Checked in Metaplex CPI.
    pub new_master_edition: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Initialized in handler as token account owned by `user`.
    pub mint_to: UncheckedAccount<'info>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: mpl_token_metadata ID.
    pub token_metadata_program: UncheckedAccount<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct VerifyNftReward<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub game: Box<Account<'info, Game>>,
    #[account(
        has_one = game,
        seeds = [
            seeds::ACHIEVEMENT,
            game.key().as_ref(),
            &achievement.id.to_le_bytes()
        ],
        bump,
        constraint = achievement.reward.unwrap() == reward.key()
    )]
    pub achievement: Box<Account<'info, Achievement>>,
    #[account(has_one = achievement)]
    pub reward: Box<Account<'info, Reward>>,
    /// CHECK: Checked in has_one relationship with `player`.
    pub user: Signer<'info>,
    #[account(has_one = user)]
    pub player_account: Box<Account<'info, Player>>,
    #[account(
        seeds = [
            seeds::NFT_CLAIM,
            reward.key().as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub claim: Account<'info, NftClaim>,
    #[account(
        has_one = player_account,
        has_one = achievement
    )]
    pub player_achievement: Box<Account<'info, PlayerAchievement>>,
    /// CHECK: Checked with constraint on `claim`.
    pub mint: UncheckedAccount<'info>,
    /// CHECK: Checked in handler.
    #[account(mut)]
    pub metadata_to_verify: UncheckedAccount<'info>,
    /// CHECK: Checked in constraint.
    #[account(
        constraint =
            check_reward_collection(&reward, collection_mint.key())
    )]
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Checked in Metaplex CPI.
    pub collection_metadata: UncheckedAccount<'info>,
    /// CHECK: Checked in Metaplex CPI.
    pub collection_edition: UncheckedAccount<'info>,
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: mpl_token_metadata address.
    pub token_metadata_program: UncheckedAccount<'info>,
}

fn check_reward_collection(reward: &Reward, maybe_collection_mint: Pubkey) -> bool {
    match &reward.reward {
        RewardKind::NonFungibleToken {
            uri: _,
            name: _,
            symbol: _,
            minted: _,
            collection: Some(key),
        } => *key == maybe_collection_mint,
        _ => false,
    }
}
