region               = "us-east-1"
environment          = "stage"
stage_name           = "default"
log_retention_days   = 7
api_description      = "Stage REST API to NLB"
binary_media_types   = ["*/*"]

common_tags = {
  Environment = "stage"
  Project     = "idlms"
  Owner       = "idlms-api"
}
