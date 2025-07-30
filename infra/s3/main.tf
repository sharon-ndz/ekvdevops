resource "aws_s3_bucket" "docker_backup" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "IDLMS Docker Backup"
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "docker_backup_versioning" {
  bucket = aws_s3_bucket.docker_backup.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}
