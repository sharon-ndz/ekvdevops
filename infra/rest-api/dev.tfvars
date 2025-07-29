region               = "us-east-1"
environment          = "dev"
stage_name           = "dev-idms"
log_retention_days   = 7
api_description      = "dev REST API to NLB"
binary_media_types = ["*/*"]

common_tags = {
  Environment = "dev"
  Project     = "idlms"
  Owner       = "idlms-api"
}

throttling_rate_limit  = 300
throttling_burst_limit = 800
metrics_enabled      = true
logging_level        = "INFO"
data_trace_enabled   = false
api_port = 4000
tf_state_bucket  = "my-terraform-state-bckt43"
tf_state_region  = "us-east-1"
