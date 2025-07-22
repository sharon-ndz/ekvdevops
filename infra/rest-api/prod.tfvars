region               = "us-east-1"
environment          = "prod"
stage_name           = "prod"
log_retention_days   = 7
api_description      = "prod REST API to NLB "
binary_media_types   = ["*/*"]

common_tags = {
  Environment = "prod"
  Project     = "idlms"
  Owner       = "idlms-api"
}
