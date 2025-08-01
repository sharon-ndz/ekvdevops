# --- Basic Setup ---
environment =            # "dev", "stage", or "prod"
region =                 # AWS region (e.g., "eu-west-1")
instance_type =          # EC2 type (e.g., "t2.micro")
ami_id =                 # AMI ID for EC2

# --- IAM / EC2 Role ---
ec2_ssm_profile_name =   # Name of EC2 instance profile (for SSM access)
ec2_ssm_role_name =      # Name of IAM role used in instance profile

# --- VPC & Networking ---
vpc_name =               # Name of your VPC
vpc_cidr =               # VPC CIDR block (e.g., "10.0.0.0/16")
enable_dns_support =     # true or false
enable_dns_hostnames =   # true or false

internet_gateway_name =          # Name for internet gateway
total_nat_gateway_required =     # Number of NAT gateways (e.g., 1 or 3)
eip_for_nat_gateway_name =       # Name prefix for Elastic IPs
nat_gateway_name =               # Name prefix for NAT gateways

# --- Public Subnets ---
public_subnets = {
  cidrs_blocks = []              # List of public subnet CIDRs
  availability_zones = []       # List of AZs (e.g., ["eu-west-1a"])
  subnets_name_prefix =         # Name prefix for subnets
  route_table_name =            # Name of route table
  map_public_ip_on_launch =     # true or false
  routes = []                   # Optional routes
}

# --- Private Subnets ---
private_subnets = {
  cidrs_blocks = []             
  availability_zones = []       
  subnets_name_prefix =         
  route_table_name =            
  routes = []                   
}

# --- Load Balancer Subnets ---
private_lb_subnets = {
  cidrs_blocks = []             
  availability_zones = []       
  subnets_name_prefix =         
  route_table_name =            
  routes = []                   
}

# --- App Subnets ---
private_app_subnets = {
  cidrs_blocks = []             
  availability_zones = []       
  subnets_name_prefix =         
  route_table_name =            
  routes = []                   
}

# --- Data Subnets ---
private_data_subnets = {
  cidrs_blocks = []             
  availability_zones = []       
  subnets_name_prefix =         
  route_table_name =            
  routes = []                   
  is_public =                   # true if this subnet needs public access
}

# --- Services Subnets ---
private_services_subnets = {
  cidrs_blocks = []             
  availability_zones = []       
  subnets_name_prefix =         
  route_table_name =            
  routes = []                   
}

# --- Application Config ---

app_ports = []                  # List of app ports (e.g., [4000, 4001,4002])

# --- Tags ---
common_tags = {
  Owner =                       # Who owns the resources (e.g., "DevOps Team")
  Project =                     # Project name
  Environment =                 # Environment again (e.g., "stage")
}

ec2_tags = {
  Name =                        # EC2 instance name tag
}

# --- Terraform State ---
tf_state_bucket =               # Name of the S3 bucket for Terraform state
