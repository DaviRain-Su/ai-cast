module ai_cast::creator;

use std::string::String;

/// 创作者档案 — 每个钱包地址可创建一个
public struct CreatorProfile has key, store {
    id: UID,
    owner: address,
    name: String,
    bio: String,
    avatar_blob_id: Option<String>,
    subscriber_count: u64,
    total_tips: u64,
    created_at: u64,
}

/// 创建创作者档案（调用者即 owner）
public fun create_profile(
    name: String,
    bio: String,
    ctx: &mut TxContext,
): CreatorProfile {
    CreatorProfile {
        id: object::new(ctx),
        owner: ctx.sender(),
        name,
        bio,
        avatar_blob_id: option::none(),
        subscriber_count: 0,
        total_tips: 0,
        created_at: ctx.epoch(),
    }
}

/// 更新创作者名称和简介
public fun update_profile(
    profile: &mut CreatorProfile,
    name: String,
    bio: String,
    ctx: &TxContext,
) {
    assert!(profile.owner == ctx.sender(), 0);
    profile.name = name;
    profile.bio = bio;
}

/// 设置头像 blob ID
public fun set_avatar(
    profile: &mut CreatorProfile,
    blob_id: String,
    ctx: &TxContext,
) {
    assert!(profile.owner == ctx.sender(), 0);
    profile.avatar_blob_id = option::some(blob_id);
}

/// 增加订阅者计数（由 subscription 模块调用）
public(package) fun increment_subscribers(profile: &mut CreatorProfile) {
    profile.subscriber_count = profile.subscriber_count + 1;
}

/// 减少订阅者计数
public(package) fun decrement_subscribers(profile: &mut CreatorProfile) {
    if (profile.subscriber_count > 0) {
        profile.subscriber_count = profile.subscriber_count - 1;
    };
}

/// 增加打赏总额（由 tipping 模块调用）
public(package) fun add_tips(profile: &mut CreatorProfile, amount: u64) {
    profile.total_tips = profile.total_tips + amount;
}

// === 查询函数 ===

public fun owner(profile: &CreatorProfile): address { profile.owner }
public fun name(profile: &CreatorProfile): &String { &profile.name }
public fun bio(profile: &CreatorProfile): &String { &profile.bio }
public fun subscriber_count(profile: &CreatorProfile): u64 { profile.subscriber_count }
public fun total_tips(profile: &CreatorProfile): u64 { profile.total_tips }
