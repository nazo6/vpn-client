use super::RouterBuilder;

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .mutation("start", |t| t(|ctx, index: u32| async move {}))
        .mutation("stop", |t| t(|ctx, _: ()| async move {}))
}
