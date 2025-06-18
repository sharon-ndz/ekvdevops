resource "aws_security_group" "open_ssh_and_app" {
  name        = "allow_ssh_and_app"
  description = "Allow SSH (22) and App (4000) access from anywhere"
  vpc_id      = module.vpc.vpc_id  # Make sure you pass this variable

  ingress {
    description      = "SSH"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  ingress {
    description      = "App Port"
    from_port        = 4000
    to_port          = 4000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

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
