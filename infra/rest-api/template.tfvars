# --- General Setup ---
region         =         # AWS region (e.g., "eu-west-1")
environment    =         # Environment name (e.g., "dev", "stage", "prod")
stage_name     =         # API Gateway stage name prefix (e.g., "stage-idlms")

# --- API Gateway Configuration ---
api_description     =     # Description of the API (e.g., "Stage REST API to NLB")
binary_media_types  = []  # List of supported binary media types (e.g., ["*/*"])
api_port            =     # Port your API is running on (e.g., 4000)

# --- Logging & Monitoring ---
log_retention_days  =     # CloudWatch log retention in days (e.g., 7)
metrics_enabled     =     # true to enable detailed metrics
logging_level       =     # Logging level (e.g., "INFO", "ERROR", "OFF")
data_trace_enabled  =     # true to enable tracing of full request/response data

# --- Throttling Settings ---
throttling_rate_limit  =  # Maximum steady-state request rate (requests per second)
throttling_burst_limit =  # Maximum burst of requests before throttling applies

# --- Common Tags ---
common_tags = {
  Environment =         # e.g., "stage"
  Project     =         # e.g., "idlms"
  Owner       =         # e.g., "idlms-api"
}

# --- Terraform Remote State ---
tf_state_bucket =         # Name of S3 bucket for remote state (e.g., "stage-...")
tf_state_region =         # Region where the state bucket is hosted (e.g., "eu-west-1")
