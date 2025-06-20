tf_state_bucket          = "my-terraform-state-bckt43"
vpc_state_key            = "stage/terraform.tfstate"
nlb_state_key            = "stage/nlb/terraform.tfstate"
region                   = "us-east-1"
environment              = "stage"

api_key_rate_limit       = 5
api_key_burst_limit      = 10
api_key_quota_limit      = 10000
api_key_quota_period     = "MONTH"

log_retention_days       = 7
api_gateway_name         = "stage-rest-api"
vpc_link_name            = "stage-vpc-link"
api_gateway_description  = "Stage environment REST API"
api_log_group_prefix     = "/aws/api-gateway/"
api_stage_name           = "default"
backend_port             = 4000
