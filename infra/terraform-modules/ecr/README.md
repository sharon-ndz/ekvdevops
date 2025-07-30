# Terraform Module: ECR Repository

This module provisions an AWS Elastic Container Registry (ECR) repository with optional image scanning and encryption support.

##Input Variables:
| Name                   | Type          | Description                                               | Default |
| ---------------------- | ------------- | --------------------------------------------------------- | ------- |
| `name`                 | `string`      | Name of the ECR repository                                | —       |
| `image_tag_mutability` | `string`      | Whether image tags are mutable (`MUTABLE` or `IMMUTABLE`) | —       |
| `scan_on_push`         | `bool`        | Enable image vulnerability scanning on push               | —       |
| `encryption_type`      | `string`      | Type of encryption to use (`AES256` or `KMS`)             | —       |
| `tags`                 | `map(string)` | Tags to apply to the repository                           | `{}`    |


#Outputs:
| Name              | Description                       |
| ----------------- | --------------------------------- |
| `repository_url`  | URL of the created ECR repository |
| `repository_name` | Name of the ECR repository        |

Features
Supports image tag immutability

Optional image scanning on push

Encryption at rest using AES256 or AWS KMS

Force deletion enabled for easier cleanup during development

Fully taggable
