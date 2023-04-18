use super::RouterBuilder;

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new().query("getAppName", |t| t(|_: (), _: ()| "rspc Test Project"))
}
