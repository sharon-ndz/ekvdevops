region               = "eu-west-1"
environment          = "prod"
stage_name           = "prod-idlms"
log_retention_days   = 7
api_description      = "prod REST API to NLB "
binary_media_types   = ["*/*"]

common_tags = {
  Environment = "prod"
  Project     = "idlms"
  Owner       = "idlms-api"
}
throttling_rate_limit  = 300
throttling_burst_limit = 800
metrics_enabled      = true
logging_level        = "INFO"
data_trace_enabled   = false

api_port = 4000
tf_state_bucket  = "my-terraform-state-bckt4321"
tf_state_region  = "eu-west-1"
