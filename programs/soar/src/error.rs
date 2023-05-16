use anchor_lang::prelude::*;

#[error_code]
pub enum SoarError {
    /// Returned if the length of a parameter exceeds its allowed limits.
    #[msg("Exceeded max length for field.")]
    InvalidFieldLength,

    /// Returned if the wrong authority attempts to sign for an instruction
    #[msg("Invalid authority for instruction.")]
    InvalidAuthority,

    /// Returned if an account that's expected to sign doesn't.
    #[msg("An expected signature isn't present.")]
    MissingSignature,

    #[msg("Reward not specified for this achievement.")]
    NoRewardForAchievement,

    #[msg("The merge account does not include this player account")]
    AccountNotPartOfMerge,

    #[msg("Tried to input score that is below the minimum or above the maximum")]
    ScoreNotWithinBounds,
}
