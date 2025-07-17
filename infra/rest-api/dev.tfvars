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
