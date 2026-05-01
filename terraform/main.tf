terraform {
  required_version = ">= 1.5.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}

variable "server_ip" {
  description = "Target Linux/Unix or Windows Server host IP"
  type        = string
}

variable "ssh_user" {
  description = "SSH user for deployment"
  type        = string
  default     = "deploy"
}

variable "ssh_private_key_path" {
  description = "SSH private key path"
  type        = string
  default     = "~/.ssh/id_ed25519"
}

resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventory.ini"
  content  = <<-EOT
    [rk_servers]
    app ansible_host=${var.server_ip} ansible_user=${var.ssh_user} ansible_ssh_private_key_file=${var.ssh_private_key_path}
  EOT
}

output "inventory_path" {
  value = local_file.ansible_inventory.filename
}
