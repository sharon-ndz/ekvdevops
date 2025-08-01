# --- General Settings ---
environment =                 # The environment name (e.g., "stage")
region     =                  # The AWS region (e.g., "eu-west-1")

# --- SSM Parameter Settings ---
ssm_param_name        =       # Full path of the SSM parameter (e.g., "/idlms/shared/stage/.env")
ssm_param_description =       # Description of what the parameter stores
ssm_param_app_tag     =       # App tag for categorization (e.g., "idlms")
app_env_content       =       # The actual .env content to store in the parameter (as a single string or HEREDOC)
