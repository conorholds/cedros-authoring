const MANIFEST_JSON: &str = include_str!("../../../cedros-extension.manifest.json");

pub fn register_extension_family() -> serde_json::Value {
    serde_json::from_str(MANIFEST_JSON).expect("extension manifest should stay valid")
}

#[cfg(any(target_arch = "wasm32", test))]
fn status_response(route_id: &str, method: &str, path: &str) -> (u16, String) {
    let manifest = register_extension_family();
    let id = manifest["extensionId"]
        .as_str()
        .expect("extension id is required");
    let route = format!("{id}:status");
    let mounted = format!("/extensions/{id}/status");
    if route_id != route || method != "GET" || (path != "/status" && path != mounted) {
        return (404, serde_json::json!({ "error": "not_found" }).to_string());
    }
    (
        200,
        serde_json::json!({ "extensionId": id, "version": manifest["version"], "status": "ready" })
            .to_string(),
    )
}

#[cfg(target_arch = "wasm32")]
wit_bindgen::generate!({ path: "wit", world: "route-only" });

#[cfg(target_arch = "wasm32")]
mod component {

    use crate::exports::cedros::extension::jobs::{
        Guest as JobsGuest, JobExecution, JobOutcome, JobSpec, JobStatus,
    };
    use crate::exports::cedros::extension::routes::{
        Guest as RoutesGuest, RouteRequest, RouteResponse, RouteSpec,
    };

    pub struct Extension;

    impl RoutesGuest for Extension {
        fn list_routes() -> Vec<RouteSpec> {
            let manifest = super::register_extension_family();
            let id = manifest["extensionId"]
                .as_str()
                .expect("extension id is required");
            vec![RouteSpec {
                route_id: format!("{id}:status"),
                method: "GET".into(),
                path: "/status".into(),
            }]
        }

        fn handle_route(request: RouteRequest) -> RouteResponse {
            let (status, body) =
                super::status_response(&request.route_id, &request.method, &request.path);
            RouteResponse {
                status,
                headers: vec![
                    ("content-type".into(), "application/json".into()),
                    ("cache-control".into(), "no-store".into()),
                ],
                body,
            }
        }
    }

    impl JobsGuest for Extension {
        fn list_jobs() -> Vec<JobSpec> {
            Vec::new()
        }
        fn run_job(_execution: JobExecution) -> JobOutcome {
            JobOutcome {
                status: JobStatus::Failed,
                details_json: r#"{"error":"no_jobs_declared"}"#.into(),
            }
        }
    }
}

#[cfg(target_arch = "wasm32")]
use component::Extension;

#[cfg(target_arch = "wasm32")]
export!(Extension);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn status_reports_the_manifest_identity_and_version() {
        let manifest = register_extension_family();
        let id = manifest["extensionId"].as_str().unwrap();
        for path in ["/status".to_string(), format!("/extensions/{id}/status")] {
            let (status, body) = status_response(&format!("{id}:status"), "GET", &path);
            assert_eq!(status, 200);
            let body: serde_json::Value = serde_json::from_str(&body).unwrap();
            assert_eq!(body["extensionId"], manifest["extensionId"]);
            assert_eq!(body["version"], manifest["version"]);
        }
    }

    #[test]
    fn unknown_routes_methods_and_paths_fail_closed() {
        let manifest = register_extension_family();
        let route = format!("{}:status", manifest["extensionId"].as_str().unwrap());
        for (id, method, path) in [
            ("unknown", "GET", "/status"),
            (route.as_str(), "POST", "/status"),
            (route.as_str(), "GET", "/private"),
            (route.as_str(), "GET", "/extensions/other/status"),
        ] {
            assert_eq!(status_response(id, method, path).0, 404);
        }
    }
}
