# --- Environment Settings ---
environment =               # Environment name (e.g., "stage")
region      =               # AWS region where ECR is created (e.g., "eu-west-1")

# --- ECR Repository Settings ---
image_tag_mutability =      # Image tag mutability ("MUTABLE" or "IMMUTABLE")
scan_on_push        =       # Enable image scan on push (true/false)
encryption_type     =       # Encryption type (e.g., "AES256" or "KMS")
