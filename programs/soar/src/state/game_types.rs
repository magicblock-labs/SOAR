pub enum GameType {
    Mobile,
    Desktop,
    Web,
    Unspecified,
}

impl GameType {
    /// Custom to enforce that `unspecified` is always stored as 255,
    /// leaving space to make additions without breaking existing logic.
    pub fn to_u8(&self) -> u8 {
        use GameType::*;
        match self {
            Mobile => 0,
            Desktop => 1,
            Web => 2,
            Unspecified => 255,
        }
    }
}

impl From<u8> for GameType {
    fn from(val: u8) -> Self {
        match val {
            0 => Self::Mobile,
            1 => Self::Desktop,
            2 => Self::Web,
            _ => Self::Unspecified,
        }
    }
}

#[allow(non_snake_case)]
pub enum Genre {
    Rpg,
    Mmo,
    Action,
    Adventure,
    Puzzle,
    Casual,
    Unspecified,
}

impl Genre {
    /// Custom to enforce that `unspecified` is always stored as 255,
    /// leaving space to make additions without breaking existing logic.
    pub fn to_u8(&self) -> u8 {
        use Genre::*;
        match self {
            Rpg => 0,
            Mmo => 1,
            Action => 2,
            Adventure => 3,
            Puzzle => 4,
            Casual => 5,
            Unspecified => 255,
        }
    }
}

impl From<u8> for Genre {
    fn from(val: u8) -> Self {
        match val {
            0 => Self::Rpg,
            1 => Self::Mmo,
            2 => Self::Action,
            3 => Self::Adventure,
            4 => Self::Puzzle,
            5 => Self::Casual,
            _ => Self::Unspecified,
        }
    }
}
