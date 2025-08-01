# --- Backend Configuration ---
tf_state_bucket  =         # S3 bucket name for Terraform remote state
tf_state_region  =         # AWS region where the state bucket is hosted
environment      =         # Environment name (e.g., "dev", "stage", "prod")
region           =         # AWS region for infrastructure (e.g., "eu-west-1")

# --- Load Balancer Configuration ---
load_balancer_type =       # Type of LB: "network" or "application"
internal           =       # true for private LB, false for public
target_port        =       # Port your app listens on (e.g., 4000)
lb_create_sg       =       # Whether to create a security group for the LB

# List of additional ports to allow (if multiple apps or containers)
additional_ports = []      # e.g., [4000, 4001, 4002]

# --- Security Group Egress Rules for LB ---
lb_egress_roles = [
  {
    description      =       # Description of the rule (e.g., "Allow all outbound")
    from_port        =       # Start of port range
    to_port          =       # End of port range
    protocol         =       # Protocol (e.g., "tcp", "-1" for all)
    cidr_blocks      = []    # IPv4 CIDRs allowed (e.g., ["0.0.0.0/0"])
    ipv6_cidr_blocks = []    # IPv6 CIDRs allowed
    security_groups  = []    # Security group IDs to allow traffic to
    self             =       # true if referencing itself
  }
]

# --- Tags ---
common_tags = {
  Environment =       # Environment tag (e.g., "stage")
  Project     =       # Project name tag (e.g., "IDMS")
}

# --- SSM Parameters ---
ssm_param_name =         # Name of the SSM parameter storing Docker logging config
ssm_tag_name   =         # Tag to associate with the SSM parameter
