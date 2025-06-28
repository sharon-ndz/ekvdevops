resource "aws_s3_bucket" "docker_backup" {
  bucket = "idlms-website-built-artifact"

  tags = {
    Name        = "IDLMS Docker Backup"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "docker_backup_versioning" {
  bucket = aws_s3_bucket.docker_backup.id

  versioning_configuration {
    status = "Enabled"
  }
}
