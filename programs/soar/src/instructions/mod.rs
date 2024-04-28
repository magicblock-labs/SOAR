#![allow(unused_imports)]

pub mod add_achievement;
pub mod add_leaderboard;
pub mod add_reward;
pub mod approve_merge;
pub mod claim_reward;
pub mod create_game;
pub mod create_player;
pub mod initiate_merge;
pub mod register_player;
pub mod submit_score;
pub mod unlock_player_achievement;
pub mod update_achievement;
pub mod update_game;
pub mod update_leaderboard;
pub mod update_player;
pub mod verify_reward;

pub use add_achievement::*;
pub use add_leaderboard::*;
pub use add_reward::*;
pub use approve_merge::*;
pub use claim_reward::*;
pub use create_game::*;
pub use create_player::*;
pub use register_player::*;
pub use submit_score::*;
pub use unlock_player_achievement::*;
pub use update_achievement::*;
pub use update_game::*;
pub use update_leaderboard::*;
pub use update_player::*;
pub use verify_reward::*;
