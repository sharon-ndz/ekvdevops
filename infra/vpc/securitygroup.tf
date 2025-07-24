resource "aws_security_group" "open_ssh_and_app" {
  name_prefix = "allow_ssh_and_app_"
  description = "Allow SSH (22) and App (4000) access from anywhere"
  vpc_id      = module.vpc.vpc_id


  lifecycle {
    create_before_destroy = true
  }
  # SSH Port
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Dynamic app ports from var.app_ports
  dynamic "ingress" {
    for_each = var.app_ports
    content {
      description = "App Port ${ingress.value}"
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  # Egress - allow all
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow-ssh-and-app"
  }
}
