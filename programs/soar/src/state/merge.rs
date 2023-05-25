use anchor_lang::prelude::*;

/// An account that represents a single user's ownership of
/// multiple [Player][super::Player] accounts.
#[account]
#[derive(Debug)]
pub struct Merged {
    /// The user that initialized this merge.
    pub initiator: Pubkey,

    /// Details of all the player accounts to be merged with the main_user's.
    pub approvals: Vec<MergeApproval>,

    /// Set to true when every user in `others` has registered their approval.
    pub merge_complete: bool,
}

/// Represents a [Player][super::Player] account involved in a merge
/// and if that account's user/authority has granted approval.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MergeApproval {
    /// The player_account pubkey.
    pub key: Pubkey,

    /// User's approval status.
    pub approved: bool,
}

impl Merged {
    /// Calculate the size of a [Merged] account given a `count`
    /// of the [MergeApproval] accounts it intends to hold.
    pub fn size(count: usize) -> usize {
        8 + // discriminator
        32 + // initiator
        4 + (count * MergeApproval::SIZE) // approvals vec
        + 1 // merge_complete
    }
}

impl MergeApproval {
    /// Size of a borsh-serialized instance of Self.
    pub const SIZE: usize = 32 + 1;

    /// Create a new instance of Self.
    pub fn new(key: Pubkey) -> Self {
        MergeApproval {
            key,
            approved: false,
        }
    }
}
