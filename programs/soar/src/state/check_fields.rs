use super::*;
use crate::SoarError;
use anchor_lang::prelude::*;

#[constant]
pub const MAX_TITLE_LEN: usize = 30;
#[constant]
pub const MAX_DESCRIPTION_LEN: usize = 200;

/// Check that field lengths don't exceed the maximum space.
///
/// Returns an error if any field has an invalid length.
pub trait FieldsCheck {
    fn check(&self) -> Result<()>;
}

impl FieldsCheck for Achievement {
    fn check(&self) -> Result<()> {
        if self.title.len() > MAX_TITLE_LEN || self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl FieldsCheck for GameAttributes {
    fn check(&self) -> Result<()> {
        if self.title.len() > MAX_TITLE_LEN || self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl FieldsCheck for Game {
    fn check(&self) -> Result<()> {
        self.meta.check()
    }
}

impl FieldsCheck for RegisterLeaderBoardInput {
    fn check(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl FieldsCheck for LeaderBoard {
    fn check(&self) -> Result<()> {
        if self.description.len() > MAX_DESCRIPTION_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl FieldsCheck for Player {
    fn check(&self) -> Result<()> {
        if self.username.len() > Self::MAX_USERNAME_LEN {
            return Err(SoarError::InvalidFieldLength.into());
        }

        Ok(())
    }
}

impl FieldsCheck for Reward {
    fn check(&self) -> Result<()> {
        match &self.reward {
            RewardKind::NonFungibleToken {
                uri,
                name,
                symbol,
                minted: _,
                collection: _,
            } => {
                if uri.len() > Reward::MAX_URI_LENGTH
                    || name.len() > Reward::MAX_NAME_LENGTH
                    || symbol.len() > Reward::MAX_SYMBOL_LENGTH
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
