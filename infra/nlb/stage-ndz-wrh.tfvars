tf_state_bucket = "stage-ndz-wrh-btl-idlms-sharon-backend-api-tfstate"
environment     = "stage-ndz-wrh"
region          = "eu-west-1"
tf_state_region  = "eu-west-1"
load_balancer_type = "network"
internal           = true
target_port        = 4000
lb_create_sg       = true
additional_ports = [4000, 4001, 4002]

lb_egress_roles = [
  {
    description      = "Allow all outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    security_groups  = []
    self             = false
  }
]

common_tags = {
  Environment = "stage-ndz-wrh"
  Project     = "IDMS"
}
ssm_param_name         = "/stage-ndz-wrh-cloudwatch/docker-config"
ssm_tag_name           = "stage-ndz-wrh-docker-cloudwatch-config"

