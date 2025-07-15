# --- dev.tfvars ---

environment     = "dev"
region          = "us-east-1"
tf_state_bucket = "my-terraform-state-bckt43"
log_retention_days = 30

common_tags = {
  Project     = "IDMS"
  Environment = "dev"
}

path_to_port_map = {
  "/api1" = "4000"
  "/api2" = "4001"
  "/api3" = "4002"
}
