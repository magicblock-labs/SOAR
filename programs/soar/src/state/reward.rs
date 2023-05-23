use super::{Reward, RewardKind};
use crate::SoarError;
use anchor_lang::prelude::*;

#[constant]
const MAX_URI_LENGTH: usize = 200;
#[constant]
const MAX_NAME_LENGTH: usize = 32;
#[constant]
const MAX_SYMBOL_LENGTH: usize = 10;

impl Reward {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + RewardKind::MAX_SIZE;

    pub fn check_field_lengths(&self) -> Result<()> {
        use RewardKind::*;
        match &self.reward {
            NonFungibleToken {
                uri,
                name,
                symbol,
                minted: _,
                collection_mint: _,
            } => {
                if uri.len() > MAX_URI_LENGTH
                    || name.len() > MAX_NAME_LENGTH
                    || symbol.len() > MAX_SYMBOL_LENGTH
                {
                    Err(SoarError::InvalidFieldLength.into())
                } else {
                    Ok(())
                }
            }
            _ => Ok(()),
        }
    }
}

impl RewardKind {
    const MAX_SIZE: usize = (200 + 4) + (32 + 4) + (10 + 4) + 8 + (1 + 32);
}
