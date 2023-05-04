use anchor_lang::prelude::*;

#[error_code]
pub enum CrateError {
    /// Returned if the length of a parameter exceeds its allowed limits.
    #[msg("Exceeded max length for field")]
    InvalidFieldLength,

    /// Returned if the wrong authority attempts to sign for an instruction
    #[msg("Invalid authority for instruction")]
    InvalidAuthority,
}
