# --- Environment ---
environment =         # e.g., "stage"
region      =         # AWS region (e.g., "eu-west-1")

# --- CloudWatch Logging ---
docker_log_group_name =         # Name of the CloudWatch Log Group (e.g., "/stage/docker/api")
log_group_tag_name    =         # Tag name for log group resource (e.g., "stage-DockerAPI")

# --- SSM Parameter Store for CloudWatch Agent Config ---
ssm_param_name =                # Name of SSM Parameter storing config (e.g., "/stage-cloudwatch/docker-config")
ssm_tag_name   =                # Tag used to identify the config (e.g., "stage-docker-cloudwatch-config")

# --- Terraform Remote State ---
tf_state_bucket =         # Name of the S3 bucket holding Terraform state
tf_state_region =         # AWS region where the state bucket is located (e.g., "eu-west-1")
