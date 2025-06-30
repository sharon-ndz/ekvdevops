resource "aws_instance" "web" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = module.vpc.public_subnets_ids[0]
  vpc_security_group_ids = [aws_security_group.open_ssh_and_app.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_ssm_profile.name
  key_name               = var.ec2_key_name

  user_data = <<-EOF
              #!/bin/bash
              set -e

              apt-get update -y
              apt-get install -y curl unzip wget snapd gnupg software-properties-common docker.io jq

              # Install AWS CLI if not present
              if ! command -v aws &> /dev/null; then
                curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                unzip awscliv2.zip
                ./aws/install
              fi

              # Install SSM Agent
              snap install amazon-ssm-agent --classic
              systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent
              systemctl start snap.amazon-ssm-agent.amazon-ssm-agent

              # Install CloudWatch Agent
              wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O /tmp/amazon-cloudwatch-agent.deb
              dpkg -i /tmp/amazon-cloudwatch-agent.deb
              chmod +x /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl

              /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
                -a fetch-config \
                -m ec2 \
                -c ssm:${var.cloudwatch_ssm_config_path} \
                -s

              # Create docker-compose.yml directly
              mkdir -p /home/ubuntu
              cat <<EOC > /home/ubuntu/docker-compose.yml
              version: '3.8'

              services:
                app:
                  image: latest
                  container_name: backend
                  ports:
                    - "4000:4000"
                  env_file:
                    - .env

                postgres:
                  image: postgres:15
                  environment:
                    POSTGRES_USER: user
                    POSTGRES_PASSWORD: password
                    POSTGRES_DB: appdb
                  ports:
                    - "5432:5432"
                  volumes:
                    - pgdata:/var/lib/postgresql/data

              volumes:
                pgdata:
              EOC

              chown ubuntu:ubuntu /home/ubuntu/docker-compose.yml
              EOF

  tags = var.ec2_tags
}
