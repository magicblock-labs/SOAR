use anchor_lang::prelude::*;

// Existence serves as proof of a valid claimed nft and
// is checked during collection verification.
#[account]
pub struct NftClaim {}
impl NftClaim {
    pub const SIZE: usize = 8;
}

#[account]
#[derive(Debug)]
/// An account representing a reward for a given achievement.
pub struct Reward {
    /// The achievement this reward is given for.
    pub achievement: Pubkey,

    /// Number of available reward spots.
    pub available_spots: u64,

    /// The reward kind. Current supports Nft and Ft rewards only.
    pub reward: RewardKind,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
/// The kind of reward to be given out.
pub enum RewardKind {
    /// Fungible token rewards.
    FungibleToken {
        /// The mint of the token to be given out.
        mint: Pubkey,

        /// The token account to withdraw from.
        account: Pubkey,

        /// Reward amount per user.
        amount: u64,
    },
    /// NFT rewards.
    NonFungibleToken {
        /// URI of the NFT to be minted.
        uri: String,

        /// Name of the NFT to be minted.
        name: String,

        /// Symbol of the NFT to be minted.
        symbol: String,

        /// Total NFTs minted so far.
        minted: u64,

        /// Optional field for a collection mint used for
        /// verifying minted rewards.
        collection: Option<Pubkey>,
    },
}

impl Reward {
    pub const MAX_URI_LENGTH: usize = 200;
    pub const MAX_NAME_LENGTH: usize = 32;
    pub const MAX_SYMBOL_LENGTH: usize = 10;

    /// Size of a borsh-serialized [Reward].
    pub const SIZE: usize = 8 + // discriminator
        32 + // achievement
        8 +  // available
        RewardKind::MAX_SIZE; // reward_kind
}

impl RewardKind {
    /// Size of an [nft][RewardKind::NonFungibleToken] reward type.
    const MAX_SIZE: usize = (200 + 4) + // uri
        (32 + 4) +  // name
        (10 + 4) +  // symbol
        8 + // minted
        1 + 32; // collection
}
