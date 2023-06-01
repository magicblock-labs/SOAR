pub enum GameType {
    Mobile,
    Desktop,
    Web,
    Unspecified,
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
