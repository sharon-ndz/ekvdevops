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

resource "aws_s3_bucket_acl" "docker_backup_acl" {
  bucket = aws_s3_bucket.docker_backup.id
  acl    = "private"
}


resource "aws_s3_bucket_public_access_block" "docker_backup_block" {
  bucket = aws_s3_bucket.docker_backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
