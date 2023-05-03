use anchor_lang::prelude::*;

#[error_code]
pub enum CrateError {
    /// This is returned if the length of a parameter exceeds its allowed limits.
    #[msg("Exceeded max length for field")]
    InvalidFieldLength,

    /// This is returned if the wrong authority tries to sign for an instruction
    #[msg("Invalid authority for instruction")]
    InvalidAuthority,
}
