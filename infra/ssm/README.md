# SSM Parameter Store (Environment Variables) Module

This module provisions an AWS Systems Manager (SSM) Parameter of type `String`, which stores application environment variables in encrypted form using base64-decoded values. This is used to centrally manage environment-specific `.env` configurations for deployment targets like EC2 instances or Docker containers.

---

## Directory Structure

infra/ssm/
├── main.tf           # Module instantiation
├── variables.tf      # Variable definitions
├── outputs.tf        # Output values

INPUTS:
| Name                    | Type     | Description                               | Required |
| ----------------------- | -------- | ----------------------------------------- | -------- |
| `environment`           | `string` | Deployment environment (e.g., dev, stage) | ✅        |
| `region`                | `string` | AWS region to deploy into                 | ✅        |
| `app_env_content`       | `string` | Base64-encoded `.env` file contents       | ✅        |
| `ssm_param_name`        | `string` | Full name of the SSM parameter            | ✅        |
| `ssm_param_description` | `string` | Description of the SSM parameter          | ✅        |
| `ssm_param_app_tag`     | `string` | Application tag for SSM parameter         | ✅        |


OUTPUTS:
| Name                    | Description                                  |
| ----------------------- | -------------------------------------------- |
| `ssm_env_param_name`    | Name of the created SSM parameter            |
| `ssm_parameter_version` | Version number of the stored parameter value |


