module ai_cast::podcast;

use std::string::String;

// === 常量 ===

const TIER_FREE: u8 = 0;
const TIER_PREMIUM: u8 = 1;

// === 错误码 ===

const ENotOwner: u64 = 0;
const EInvalidTier: u64 = 1;

/// 播客对象 — 存储在链上的播客元数据
public struct Podcast has key, store {
    id: UID,
    creator: address,
    title: String,
    description: String,
    audio_blob_id: String,
    script_blob_id: Option<String>,
    cover_blob_id: Option<String>,
    duration_secs: u64,
    style: String,
    source_url: Option<String>,
    tier: u8,
    seal_policy_id: Option<ID>,
    tip_total: u64,
    play_count: u64,
    created_at: u64,
}

/// 发布事件
public struct PodcastPublished has copy, drop {
    podcast_id: ID,
    creator: address,
    title: String,
    audio_blob_id: String,
    tier: u8,
}

/// 发布播客
public fun publish(
    title: String,
    description: String,
    audio_blob_id: String,
    script_blob_id: Option<String>,
    cover_blob_id: Option<String>,
    duration_secs: u64,
    style: String,
    source_url: Option<String>,
    tier: u8,
    ctx: &mut TxContext,
): Podcast {
    assert!(tier == TIER_FREE || tier == TIER_PREMIUM, EInvalidTier);

    let podcast = Podcast {
        id: object::new(ctx),
        creator: ctx.sender(),
        title,
        description,
        audio_blob_id,
        script_blob_id,
        cover_blob_id,
        duration_secs,
        style,
        source_url,
        tier,
        seal_policy_id: option::none(),
        tip_total: 0,
        play_count: 0,
        created_at: ctx.epoch(),
    };

    sui::event::emit(PodcastPublished {
        podcast_id: object::id(&podcast),
        creator: ctx.sender(),
        title: podcast.title,
        audio_blob_id: podcast.audio_blob_id,
        tier,
    });

    podcast
}

/// 设置 SEAL 策略 ID（仅 owner 可调用）
public fun set_seal_policy(
    podcast: &mut Podcast,
    policy_id: ID,
    ctx: &TxContext,
) {
    assert!(podcast.creator == ctx.sender(), ENotOwner);
    podcast.seal_policy_id = option::some(policy_id);
}

/// 更新播放计数
public fun increment_play_count(podcast: &mut Podcast) {
    podcast.play_count = podcast.play_count + 1;
}

/// 删除播客（仅 owner 可调用）
public fun delete(podcast: Podcast, ctx: &TxContext) {
    assert!(podcast.creator == ctx.sender(), ENotOwner);
    let Podcast {
        id,
        creator: _,
        title: _,
        description: _,
        audio_blob_id: _,
        script_blob_id: _,
        cover_blob_id: _,
        duration_secs: _,
        style: _,
        source_url: _,
        tier: _,
        seal_policy_id: _,
        tip_total: _,
        play_count: _,
        created_at: _,
    } = podcast;
    object::delete(id);
}

/// 增加打赏总额（由 tipping 模块调用）
public(package) fun add_tips(podcast: &mut Podcast, amount: u64) {
    podcast.tip_total = podcast.tip_total + amount;
}

// === 查询函数 ===

public fun creator(podcast: &Podcast): address { podcast.creator }
public fun title(podcast: &Podcast): &String { &podcast.title }
public fun audio_blob_id(podcast: &Podcast): &String { &podcast.audio_blob_id }
public fun script_blob_id(podcast: &Podcast): &Option<String> { &podcast.script_blob_id }
public fun tier(podcast: &Podcast): u8 { podcast.tier }
public fun tip_total(podcast: &Podcast): u64 { podcast.tip_total }
public fun play_count(podcast: &Podcast): u64 { podcast.play_count }
public fun duration_secs(podcast: &Podcast): u64 { podcast.duration_secs }
public fun style(podcast: &Podcast): &String { &podcast.style }
public fun is_free(podcast: &Podcast): bool { podcast.tier == TIER_FREE }
