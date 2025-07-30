variable "name" {
  type        = string
  description = "SSM parameter name"
}

variable "description" {
  type        = string
  description = "SSM parameter description"
}

variable "type" {
  type        = string
  default     = "String"
  description = "SSM parameter type (String, SecureString, StringList)"
}

variable "value" {
  type        = string
  description = "SSM parameter value (decoded or plaintext)"
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags for the SSM parameter"
}
