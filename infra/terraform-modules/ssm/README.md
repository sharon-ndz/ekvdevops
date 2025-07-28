# Terraform Module: AWS SSM Parameter

This Terraform module creates a single [AWS Systems Manager (SSM) Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) parameter. It's designed to be reusable and used by other infrastructure components for managing environment variables or sensitive configurations.

---

## 📁 Module Path

infra/terraform-modules/ssm


---

## 🚀 Features

- Supports `String`, `SecureString`, or `StringList` types
- Ignores updates to `value` unless explicitly changed
- Adds custom tags for auditing and organization
- Outputs parameter name and version
- Designed to integrate cleanly into broader Terraform environments

---

## 📥 Input Variables

| Name        | Type           | Description                                          | Default   | Required |
|-------------|----------------|------------------------------------------------------|-----------|----------|
| `name`      | `string`       | Name of the SSM parameter                            | —         |  Yes    |
| `description` | `string`     | Description of the parameter                         | —         | Yes    |
| `type`      | `string`       | Type of the parameter (`String`, `SecureString`, etc) | `"String"` |  No     |
| `value`     | `string`       | The parameter value (in plaintext)                   | —         |  Yes    |
| `tags`      | `map(string)`  | Tags to apply to the parameter                       | `{}`      |  No     |

---

## 📤 Outputs

| Name                  | Description                                |
|-----------------------|--------------------------------------------|
| `ssm_parameter_name`  | The full name of the created SSM parameter |
| `ssm_parameter_version` | The current version of the parameter     |

---

## 🔒 Lifecycle Rules

This module uses the `ignore_changes` lifecycle block to **avoid updating the parameter value** unintentionally:

```hcl
lifecycle {
  ignore_changes = [value]
}

