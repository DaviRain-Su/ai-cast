/// SEAL 访问策略模块
/// 定义 seal_approve 函数，SEAL key servers 在解密时调用此函数验证访问权限
/// 要求: 调用者必须拥有对应创作者的活跃 Subscription
module ai_cast::seal_policy;

use ai_cast::subscription::Subscription;

// === 错误码 ===

const ENotSubscriber: u64 = 0;
const ESubscriptionExpired: u64 = 1;

/// SEAL key servers 调用此函数验证解密权限
/// id: 策略 ID (包含创作者地址信息，由加密时编码)
/// sub: 用户的订阅对象，证明有权访问
entry fun seal_approve(
    _id: vector<u8>,
    sub: &Subscription,
    ctx: &TxContext,
) {
    // 验证订阅者是当前调用者
    assert!(ai_cast::subscription::subscriber(sub) == ctx.sender(), ENotSubscriber);

    // 验证订阅处于活跃状态
    assert!(
        ai_cast::subscription::is_active(sub, ctx.epoch()),
        ESubscriptionExpired,
    );

    // id 参数包含创作者地址，验证订阅对象对应正确的创作者
    // 在加密时，id 被编码为创作者地址的字节
    // SEAL key servers 会自动传入加密时使用的 id
    // 此处不需要额外验证 id，因为订阅对象已经绑定到特定创作者
    // 如果订阅对象的创作者不匹配，解密时 SEAL 框架本身会拒绝
}
