📚 Azure Resource Naming Standards - Wiki

Version: 1.0
Last Updated: October 2025
Organization: Align Technology, Inc.
Maintained By: Infrastructure Team

📑 Table of Contents

Executive Summary

This document defines the Azure resource naming standards for Align Technology. Every resource name embeds its subscription identity using systematic formulas that respect Azure's character limits while maintaining readability.

Key Benefits:

✅ Instant subscription identification from resource name

✅ No naming collisions across environments

✅ Automation-ready patterns

✅ Cost tracking by subscription/cost center

✅ Scales from 1 to 100+ subscriptions

Quick Start:

Resource Group: rg-{fullcleanedsubname}

KeyVault: kv{#}{first9}-{last9}

Storage: sa{type2}{first9}{last9}

Log Analytics: law-{fullcleanedsubname}

VM: {env}{loc}{#}{func}{inst} (15 chars max!)

Why Naming Standards Matter

Problems Without Standards

❌ Can't identify which subscription owns a resource

❌ Name conflicts cause deployment failures

❌ No consistency across teams

❌ Difficult to search and filter in portal

❌ Cost allocation becomes impossible

❌ Automation scripts break

❌ Hit character limits unexpectedly

Business Value

💰 Cost Management: Track spending by subscription/cost center

🔒 Security: Clear ownership and access boundaries

⚡ Speed: Reusable templates across subscriptions

📊 Compliance: Clear audit trails

🚀 Scale: Works for any number of subscriptions

🎯 Clarity: Visual pattern recognition

Core Principles

1. Subscription Identity Embedded

Every resource name contains a portion of its subscription name, making ownership immediately clear.

2. Character Limit Compliance

All patterns work within Azure's strict character limits (15 for Windows VMs, 24 for KeyVault/Storage, etc.)

3. Systematic Formulas

Names follow mathematical formulas (first N chars + last M chars), not arbitrary abbreviations.

4. Readability Over Brevity

Where Azure allows, use dashes for visual separation (except Storage Accounts).

5. Automation-Friendly

Patterns can be scripted and automated for Infrastructure-as-Code.

6. Multi-Tenant Safe

Supports multiple KeyVaults, Storage Accounts, regions, and cost centers in one subscription.

Resource Scoping Model

Each naming pattern is driven by the resource's Azure scope:

| Scope | Resources | Identity Strategy | Region in Name? |
|-------|-----------|-------------------|-----------------|
| Subscription-scoped | RG, LAW, RSV, VNet | Full cleaned subscription name | No (spans regions) |
| Globally unique (DNS) | Key Vault, Storage Account | F9/B9 extraction (24 char limit) | No |
| Region-locked | VM, NIC, Disk, NSG | Env + region + purpose (15 char limit) | Yes |

Rules:
1. Region ONLY appears in resources physically bound to a datacenter (VM, NIC, Disk, NSG)
2. Subscription identity appears in ALL subscription-scoped or globally-unique resources
3. F9/B9 extraction is used ONLY when char limits prevent using the full name (KV=24, SA=24)
4. Full cleaned subscription name is used when char limits are generous (RG=90, LAW=63, RSV=50, VNet=64)
5. VM names encode operational context (env, region, purpose) because the 15-char limit prevents subscription identity

Complete Naming Patterns

Tier 1: Globally Unique Resources

Storage Account

PATTERN:  sa{type2}{first9}{last9}
EXAMPLE:  sa11aligninfrputingdev
LIMIT:    3-24 characters
ALLOWED:  Lowercase letters (a-z) + numbers (0-9) ONLY
UNIQUE:   Globally across ALL of Azure
IMMUTABLE: Cannot change after creation


Formula Breakdown:

sa = Storage Account prefix (2 chars)

{type2} = 2-digit type code (2 chars)

{first9} = First 9 chars of subscription name, lowercase, no spaces (9 chars)

{last9} = Last 9 chars of subscription name, lowercase, no spaces (9 chars)

Total: 22 characters

Type Codes:

Code

Purpose

Use Case

11

Boot Diagnostics (Primary)

VM boot logs and screenshots

12

Boot Diagnostics (Secondary)

Backup diagnostics storage

21

VM Data Storage

Additional data disks

31

Backup/Recovery

Azure Backup storage

41

Application Data

App-specific storage

51

Log Storage

Application logs

61

File Shares

SMB file shares

71

Blob Storage

General blobs

81

Table/Queue

NoSQL/messaging

91

Archive/Cold

Long-term archive

Examples:

Subscription: "Align Infra ITIO Computing Dev"
→ sa11aligninfrputingdev (Boot Diagnostics)
→ sa21aligninfrputingdev (VM Data)
→ sa61aligninfrputingdev (File Shares)

Subscription: "Foundational and IAM Services"
→ sa11foundationiamservices (Boot Diagnostics)
→ sa41foundationiamservices (Application Data)


KeyVault

PATTERN:  kv{#}{first9}-{last9}
EXAMPLE:  kv1AlignInfr-putingDev
LIMIT:    3-24 characters
ALLOWED:  Alphanumeric (a-z, A-Z, 0-9) + hyphens (-)
UNIQUE:   Subscription-scoped
IMMUTABLE: Cannot change after creation


Formula Breakdown:

kv = KeyVault prefix (2 chars)

{#} = KeyVault number 1-9 (1 char)

{first9} = First 9 chars of subscription name, no spaces (9 chars)

- = Separator for readability (1 char)

{last9} = Last 9 chars of subscription name, no spaces (9 chars)

Total: 22 characters

KeyVault Numbers:

Number

Purpose

Example Use

1

Infrastructure/Primary

VM passwords, SSH keys, infrastructure certs

2

Application Secrets

API keys, connection strings, app config

3

Regional - Primary

Secrets for West US 2 deployments

4

Regional - Secondary

Secrets for East US (DR)

5

Cost Center 1

Business unit 1 secrets

6

Cost Center 2

Business unit 2 secrets

7

DevOps/CI-CD

Pipeline secrets, deployment creds

8

Security/Compliance

Security keys, audit certs

9

Backup/DR

Disaster recovery keys

Examples:

Subscription: "Align Infra ITIO Computing Dev"
→ kv1AlignInfr-putingDev (Infrastructure)
→ kv2AlignInfr-putingDev (Applications)
→ kv3AlignInfr-putingDev (West US 2 Regional)

Subscription: "Finance ERP Production"
→ kv1FinanceERP-Production (Infrastructure)
→ kv2FinanceERP-Production (Applications)


Windows Virtual Machine

PATTERN:  {env}{location}{number}{function}{instance}
EXAMPLE:  devaz1rgtapp01
LIMIT:    1-15 characters (CRITICAL!)
ALLOWED:  Alphanumeric (a-z, A-Z, 0-9) + hyphens (-)
UNIQUE:   Resource Group-scoped
IMMUTABLE: Cannot change (requires rebuild)


⚠️ WARNING: Windows VM names CANNOT exceed 15 characters. This is the most restrictive limit in Azure.

Formula Breakdown:

{env} = Environment (3 chars): dev, tst, stg, prd

{location} = Azure region code (3 chars): az1, az2, az3

{number} = Sequential identifier (1 char): 1, 2, 3

{function} = Role/team/function (3-4 chars): rgt, app, web, sql, db

{instance} = Instance number (2 chars): 01, 02, 03

Location Codes:

Code

Azure Region

az1

West US 2

az2

East US

az3

Central US

az4

North Europe

az5

West Europe

Examples:

devaz1rgtapp01  = Dev, West US 2, RGT team, App server, Instance 01
devaz1rgtdb01   = Dev, West US 2, RGT team, Database, Instance 01
devaz1rgtweb01  = Dev, West US 2, RGT team, Web server, Instance 01
prdaz1sqldb01   = Prod, West US 2, SQL server, Instance 01
tstaz2webfe02   = Test, East US, Web frontend, Instance 02


Tier 2: Subscription-Scoped Resources

Resource Group

PATTERN:  rg-{fullcleanedsubname}
EXAMPLE:  rg-AlignInfraITIOComputingDev
LIMIT:    1-90 characters
NOTE:     No region, no workload — RGs are subscription-scoped and can span regions


Recovery Services Vault

PATTERN:  rsv-{fullsubscriptionname}
EXAMPLE:  rsv-AlignInfraITIOComputingDev
LIMIT:    2-50 characters


Virtual Network

PATTERN:  vnet-{fullsubscriptionname}
EXAMPLE:  vnet-AlignInfraITIOComputingDev
LIMIT:    2-64 characters


Log Analytics Workspace

PATTERN:  law-{fullsubscriptionname}
EXAMPLE:  law-AlignInfraITIOComputingDev
LIMIT:    4-63 characters
NOTE:     Dev/Non-Prod = Skip | Production = Required


Tier 3: Region-Locked / VM-Dependent Resources

Network Interface

PATTERN:  nic-{vmname}
EXAMPLE:  nic-devaz1rgtapp01
LIMIT:    1-80 characters


For VMs with multiple NICs:

PATTERN:  nic-{vmname}-{number}
EXAMPLE:  nic-devaz1rgtapp01-01
          nic-devaz1rgtapp01-02


Managed Disks

OS Disk:

PATTERN:  disk-{vmname}-os
EXAMPLE:  disk-devaz1rgtapp01-os
LIMIT:    1-80 characters


Data Disks:

PATTERN:  disk-{vmname}-data{##}
EXAMPLE:  disk-devaz1rgtapp01-data01
          disk-devaz1rgtapp01-data02
LIMIT:    1-80 characters


Public IP Address

PATTERN:  pip-{vmname}
EXAMPLE:  pip-devaz1rgtapp01
LIMIT:    1-80 characters
NOTE:     Align typically uses Azure Bastion (no public IPs)


Network Security Group

PATTERN:  nsg-{subnet}-{region}
EXAMPLE:  nsg-default-westus2
LIMIT:    1-80 characters
NOTE:     Align does NOT use NSGs organizationally


Real-World Examples

Example 1: Single VM Deployment

Subscription: "Align Infra ITIO Computing Dev"
Scenario: Deploy one development VM for script testing
Region: West US 2
Cost Center: 30398

Resources Created:

Resource Group:     rg-AlignInfraITIOComputingDev
KeyVault:           kv1AlignInfr-putingDev
Storage Account:    sa11aligninfrputingdev
Log Analytics:      law-AlignInfraITIOComputingDev
Virtual Machine:    devaz1rgtapp01
Network Interface:  nic-devaz1rgtapp01
OS Disk:            disk-devaz1rgtapp01-os


Why This Works:

Single KeyVault (kv1) for infrastructure secrets

Single Storage Account for boot diagnostics

All resources traceable to subscription

VM name under 15 character limit

No naming conflicts

Example 2: Multi-Tier Application

Subscription: "Align Infra ITIO Computing Dev"
Scenario: Deploy 3-tier application (Web, App, Database)
Region: West US 2
Cost Center: 30398

Resources Created:

KeyVault:           kv1AlignInfr-putingDev (shared passwords)
Storage Account:    sa11aligninfrputingdev (all boot diagnostics)
Storage Account:    sa21aligninfrputingdev (database data)

Web Tier:
  VM:               devaz1rgtweb01
  NIC:              nic-devaz1rgtweb01
  OS Disk:          disk-devaz1rgtweb01-os

App Tier:
  VM:               devaz1rgtapp01
  NIC:              nic-devaz1rgtapp01
  OS Disk:          disk-devaz1rgtapp01-os

Database Tier:
  VM:               devaz1rgtdb01
  NIC:              nic-devaz1rgtdb01
  OS Disk:          disk-devaz1rgtdb01-os
  Data Disk 1:      disk-devaz1rgtdb01-data01
  Data Disk 2:      disk-devaz1rgtdb01-data02


Example 3: Multiple KeyVaults (Multi-Team)

Subscription: "Align Infra ITIO Computing Dev"
Scenario: Multiple teams need isolated secrets

Infrastructure Team:

KeyVault:           kv1AlignInfr-putingDev
Purpose:            VM passwords, SSH keys, infrastructure certs
Access:             Infrastructure team only


Application Development Team:

KeyVault:           kv2AlignInfr-putingDev
Purpose:            Database connections, API keys, OAuth secrets
Access:             Dev team only


Regional Deployment (West US 2):

KeyVault:           kv3AlignInfr-putingDev
Purpose:            West US 2 specific secrets
Access:             Regional resources


Regional Deployment (East US - DR):

KeyVault:           kv4AlignInfr-putingDev
Purpose:            East US disaster recovery secrets
Access:             DR resources


Cost Center 30398:

KeyVault:           kv5AlignInfr-putingDev
Purpose:            Business unit 1 secrets
Access:             Cost center 30398 only


Cost Center 40567:

KeyVault:           kv6AlignInfr-putingDev
Purpose:            Business unit 2 secrets
Access:             Cost center 40567 only


Why Multiple KeyVaults?

🔒 Security isolation between teams

💰 Cost tracking per team/cost center

🌍 Performance (regional secret retrieval)

📋 Separate audit trails

🎯 Granular RBAC policies

Example 4: Multiple Storage Accounts (Multi-Purpose)

Subscription: "Align Infra ITIO Computing Dev"
Scenario: Different storage needs

Boot Diagnostics - Primary:

Name:               sa11aligninfrputingdev
Type Code:          11
Purpose:            VM boot logs for all dev VMs
Redundancy:         LRS (local, dev environment)
VMs Using:          devaz1rgtapp01, devaz1rgtdb01, devaz1rgtweb01


Boot Diagnostics - DR Region:

Name:               sa12aligninfrputingdev
Type Code:          12
Purpose:            VM boot logs for East US VMs
Redundancy:         LRS (local to East US)


VM Data Storage:

Name:               sa21aligninfrputingdev
Type Code:          21
Purpose:            Page blobs for VM data disks
Redundancy:         GRS (geo-redundant)


Application File Shares:

Name:               sa61aligninfrputingdev
Type Code:          61
Purpose:            SMB file shares for applications
Redundancy:         ZRS (zone-redundant)


Application Logs:

Name:               sa51aligninfrputingdev
Type Code:          51
Purpose:            Application logs and diagnostics
Redundancy:         LRS (logs are disposable)


Long-Term Archive:

Name:               sa91aligninfrputingdev
Type Code:          91
Purpose:            Compliance data, long-term retention
Redundancy:         GRS (critical archive)
Tier:               Cool/Archive (lowest cost)


Why Multiple Storage Accounts?

💰 Different redundancy levels = cost optimization

⚡ Separate IOPS limits per account = better performance

📊 Easier metrics tracking per purpose

🔒 Different access policies per workload

📏 Azure per-account limits (500 TB, IOPS caps)

The Dash Pattern Discovery

Visual Hierarchy Language

During implementation, we discovered that dash placement creates an unintentional but valuable visual pattern:

NO DASHES:
  sa11aligninfrputingdev
  └─ Azure platform constraint (storage = lowercase + numbers only)
  └─ Signals: Standalone service resource

INTERNAL DASH (readability separator):
  kv1AlignInfr-putingDev
  └─ Separates first9 from last9 for visual clarity
  └─ Signals: Subscription-identity resource

PREFIX DASH (ownership indicator):
  nic-devaz1rgtapp01
  disk-devaz1rgtapp01-os
  pip-devaz1rgtapp01
  └─ Dash after prefix shows "belongs to" relationship
  └─ Signals: VM-dependent resource

MULTIPLE DASHES (hierarchy):
  disk-devaz1rgtapp01-data01
  └─ Shows: resource type - parent - specific purpose
  └─ Signals: Complex dependency relationship


Pattern Rules

Pattern

Meaning

Examples

No dashes

Azure constraint OR globally unique service

sa11aligninfr...

Internal dash

Subscription identity separator

kv1AlignInfr-putingDev

Prefix dash

"Belongs to" relationship

nic-vmname, pip-vmname

Multiple dashes

Hierarchical relationship

disk-vmname-os, disk-vmname-data01

Quick Recognition

When scanning resources in Azure Portal:

See sa... (no dashes)? → Standalone storage service

See kv...-..-... (internal dash)? → KeyVault with sub identity

See nic-... (prefix dash)? → Attached to a VM

See disk-...-...-... (multiple dashes)? → VM disk with type

Type Codes Reference

Storage Account Type Codes (2-Digit)

Code

Purpose

Redundancy (Dev)

Redundancy (Prod)

Use Case

11

Boot Diagnostics Primary

LRS

LRS or GRS

Primary VM boot logs

12

Boot Diagnostics Secondary

LRS

LRS

DR region boot logs

21

VM Data Storage

LRS

GRS

Additional VM data disks

31

Backup/Recovery

LRS

GRS

Azure Backup storage

41

Application Data

LRS

GRS

App-specific storage

51

Log Storage

LRS

LRS

Application logs

61

File Shares

LRS

GRS or ZRS

SMB file shares

71

Blob Storage

LRS

GRS

General-purpose blobs

81

Table/Queue

LRS

GRS

NoSQL tables/queues

91

Archive/Cold

LRS

GRS

Long-term archive

Redundancy Codes:

LRS: Locally Redundant Storage (3 copies in one datacenter) - Lowest cost

ZRS: Zone Redundant Storage (3 copies across availability zones) - Medium cost

GRS: Geo-Redundant Storage (6 copies, local + paired region) - Higher cost

GZRS: Geo-Zone Redundant Storage (ZRS + geo-replication) - Highest cost

KeyVault Number Reference (1-9)

Number

Purpose

Typical Contents

Access Pattern

1

Infrastructure/Primary

VM passwords, SSH keys, TLS certs

Infrastructure team

2

Application Secrets

API keys, connection strings, OAuth

Application team

3

Regional - Primary

West US 2 region secrets

Primary region resources

4

Regional - Secondary

East US region secrets (DR)

DR region resources

5

Cost Center 1

Business unit 1 secrets

Cost center 1 only

6

Cost Center 2

Business unit 2 secrets

Cost center 2 only

7

DevOps/CI-CD

Pipeline secrets, service principals

DevOps pipelines

8

Security/Compliance

Security keys, audit certs

Security team

9

Backup/DR

DR keys, recovery secrets

Backup systems

PowerShell Helper Functions

Get-KeyVaultName

function Get-KeyVaultName {
    <#
    .SYNOPSIS
        Generates KeyVault name from subscription name
    .PARAMETER SubscriptionName
        Full Azure subscription name
    .PARAMETER Number
        KeyVault number (1-9)
    .EXAMPLE
        Get-KeyVaultName "Align Infra ITIO Computing Dev" -Number 1
        Returns: kv1AlignInfr-putingDev
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$SubscriptionName,
        
        [Parameter(Mandatory=$false)]
        [ValidateRange(1, 9)]
        [int]$Number = 1
    )
    
    $cleanName = $SubscriptionName -replace '\s', ''
    
    # Pattern: kv{#}{first9}-{last9}
    $first9 = $cleanName.Substring(0, [Math]::Min(10, $cleanName.Length))
    $lastChars = [Math]::Min(10, $cleanName.Length)
    $last9 = $cleanName.Substring($cleanName.Length - $lastChars, $lastChars)
    
    $kvName = "kv$Number$first9-$last9"
    
    if ($kvName.Length -gt 24) {
        Write-Warning "KeyVault name exceeds 24 characters: $($kvName.Length)"
        return $null
    }
    
    Write-Host "✓ KeyVault Name: $kvName ($($kvName.Length) chars)" -ForegroundColor Green
    Write-Host "  Purpose: $(Get-KeyVaultPurpose $Number)" -ForegroundColor Cyan
    return $kvName
}

function Get-KeyVaultPurpose {
    param([int]$Number)
    
    $purposes = @{
        1 = 'Infrastructure/Primary'
        2 = 'Application Secrets'
        3 = 'Regional - Primary'
        4 = 'Regional - Secondary (DR)'
        5 = 'Cost Center 1'
        6 = 'Cost Center 2'
        7 = 'DevOps/CI-CD'
        8 = 'Security/Compliance'
        9 = 'Backup/DR'
    }
    
    return $purposes[$Number]
}


Get-StorageAccountName

function Get-StorageAccountName {
    <#
    .SYNOPSIS
        Generates Storage Account name from subscription name
    .PARAMETER SubscriptionName
        Full Azure subscription name
    .PARAMETER TypeCode
        2-digit storage type code (11-99)
    .EXAMPLE
        Get-StorageAccountName "Align Infra ITIO Computing Dev" -TypeCode 11
        Returns: sa11aligninfrputingdev
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$SubscriptionName,
        
        [Parameter(Mandatory=$false)]
        [ValidateRange(11, 99)]
        [int]$TypeCode = 11
    )
    
    $cleanName = ($SubscriptionName -replace '\s', '').ToLower()
    
    # Pattern: sa{type2}{first9}{last9}
    $first9 = $cleanName.Substring(0, [Math]::Min(9, $cleanName.Length))
    $lastChars = [Math]::Min(9, $cleanName.Length)
    $last9 = $cleanName.Substring($cleanName.Length - $lastChars, $lastChars)
    
    $saName = "sa$TypeCode$first9$last9"
    
    # Ensure lowercase and ≤24 chars
    $saName = $saName.ToLower()
    if ($saName.Length -gt 24) {
        Write-Warning "Storage Account name exceeds 24 characters: $($saName.Length)"
        $saName = $saName.Substring(0, 24)
    }
    
    Write-Host "✓ Storage Account Name: $saName ($($saName.Length) chars)" -ForegroundColor Green
    Write-Host "  Type: $(Get-StorageAccountType $TypeCode)" -ForegroundColor Cyan
    return $saName
}

function Get-StorageAccountType {
    param([int]$Code)
    
    $types = @{
        11 = 'Boot Diagnostics (Primary)'
        12 = 'Boot Diagnostics (Secondary)'
        21 = 'VM Data Storage'
        31 = 'Backup/Recovery'
        41 = 'Application Data'
        51 = 'Log Storage'
        61 = 'File Shares (SMB)'
        71 = 'Blob Storage (General)'
        81 = 'Table/Queue Storage'
        91 = 'Archive/Cold Storage'
    }
    
    if ($types.ContainsKey($Code)) {
        return $types[$Code]
    }
    return "Custom Type $Code"
}


Test-AzureResourceName

function Test-AzureResourceName {
    <#
    .SYNOPSIS
        Validates Azure resource names against character limits
    .PARAMETER Name
        Resource name to validate
    .PARAMETER Type
        Resource type (VM, KeyVault, StorageAccount)
    .EXAMPLE
        Test-AzureResourceName "devaz1rgtapp01" -Type VM
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('VM','KeyVault','StorageAccount','NIC','Disk')]
        [string]$Type
    )
    
    $limits = @{
        'VM' = 15
        'KeyVault' = 24
        'StorageAccount' = 24
        'NIC' = 80
        'Disk' = 80
    }
    
    $maxLength = $limits[$Type]
    $actualLength = $Name.Length
    
    if ($actualLength -gt $maxLength) {
        Write-Host "❌ INVALID: $Name" -ForegroundColor Red
        Write-Host "   Length: $actualLength chars (max: $maxLength)" -ForegroundColor Red
        return $false
    }
    
    # Check character restrictions
    if ($Type -eq 'StorageAccount') {
        if ($Name -notmatch '^[a-z0-9]+$') {
            Write-Host "❌ INVALID: $Name" -ForegroundColor Red
            Write-Host "   Storage accounts must be lowercase letters and numbers only" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host "✓ VALID: $Name" -ForegroundColor Green
    Write-Host "  Length: $actualLength / $maxLength chars" -ForegroundColor Cyan
    return $true
}


Complete Example Usage

# Generate names for a new subscription
$subName = "Align Infra ITIO Computing Dev"

Write-Host "`n=== Generating Azure Resource Names ===" -ForegroundColor Cyan

# KeyVaults
Get-KeyVaultName $subName -Number 1
Get-KeyVaultName $subName -Number 2

# Storage Accounts
Get-StorageAccountName $subName -TypeCode 11
Get-StorageAccountName $subName -TypeCode 21

# Validate VM names
Test-AzureResourceName "devaz1rgtapp01" -Type VM
Test-AzureResourceName "devaz1rgtapplication01" -Type VM  # Too long!


Pre-Flight Checklist

Run before ANY Azure deployment:

Quick Check (30 seconds)

Write-Host "=== Azure Deployment Pre-Flight Check ===" -ForegroundColor Cyan

# 1. Azure CLI installed?
Write-Host "`n1. Checking Azure CLI..." -ForegroundColor Yellow
az --version | Select-String "azure-cli"

# 2. Logged in?
Write-Host "`n2. Checking Azure login..." -ForegroundColor Yellow
az account show --query "{User:user.name, Subscription:name}" --output table

# 3. Bicep available?
Write-Host "`n3. Checking Bicep..." -ForegroundColor Yellow
az bicep version

# 4. Can list resources?
Write-Host "`n4. Testing permissions..." -ForegroundColor Yellow
az group list --output table

Write-Host "`n=== Pre-Flight Complete ===" -ForegroundColor Green


Comprehensive Check (2 minutes)

Write-Host "=== Comprehensive Azure Pre-Flight Check ===" -ForegroundColor Cyan

# 1. Azure CLI
Write-Host "`n1. Checking Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az --version | Select-String "azure-cli" | Select-Object -First 1
    Write-Host "   ✓ $azVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Azure CLI not found!" -ForegroundColor Red
    Write-Host "   Install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
}

# 2. Login Status
Write-Host "`n2. Checking Azure login..." -ForegroundColor Yellow
try {
    $account = az account show | ConvertFrom-Json
    Write-Host "   ✓ Logged in as: $($account.user.name)" -ForegroundColor Green
    Write-Host "   ✓ Subscription: $($account.name)" -ForegroundColor Green
    Write-Host "   ✓ Tenant: $($account.tenantId)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Not logged in!" -ForegroundColor Red
    Write-Host "   Run: az login" -ForegroundColor Yellow
}

# 3. Bicep
Write-Host "`n3. Checking Bicep..." -ForegroundColor Yellow
try {
    $bicepVersion = az bicep version
    Write-Host "   ✓ Bicep version: $bicepVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Bicep not found. Installing..." -ForegroundColor Yellow
    az bicep install
}

# 4. VSCode (optional)
Write-Host "`n4. Checking VSCode (optional)..." -ForegroundColor Yellow
try {
    $codeVersion = code --version | Select-Object -First 1
    Write-Host "   ✓ VSCode installed: $codeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ VSCode not found (optional for editing)" -ForegroundColor Yellow
}

# 5. Permissions Test
Write-Host "`n5. Testing Azure permissions..." -ForegroundColor Yellow
try {
    $rgCount = (az group list | ConvertFrom-Json).Count
    Write-Host "   ✓ Can list resource groups ($rgCount found)" -ForegroundColor Green
    
    $kvCount = (az keyvault list | ConvertFrom-Json).Count
    Write-Host "   ✓ Can list KeyVaults ($kvCount found)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Permission issue!" -ForegroundColor Red
    Write-Host "   Check your Azure role assignments" -ForegroundColor Yellow
}

# 6. Resource Name Validation Functions
Write-Host "`n6. Loading helper functions..." -ForegroundColor Yellow
if (Get-Command Get-KeyVaultName -ErrorAction SilentlyContinue) {
    Write-Host "   ✓ Naming helper functions loaded" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Helper functions not loaded" -ForegroundColor Yellow
    Write-Host "   Run: . .\AzureNamingFunctions.ps1" -ForegroundColor Yellow
}

Write-Host "`n=== Pre-Flight Complete ===" -ForegroundColor Cyan
Write-Host "If all checks passed, you're ready to deploy!" -ForegroundColor Green


Deployment Workflow

Phase 1: Discovery (5 minutes)

Step 1: Answer Basic Questions

Environment Type: Production, Development, or Testing?

Operating System: Windows Server 2022, Ubuntu 22.04, etc.?

VM Size: Standard_B2s, Standard_B2ms, Standard_D2s_v3, etc.?

Admin Username: (1-20 chars, no admin/administrator/root/guest)

VM Name: (15 chars max for Windows, alphanumeric)

Step 2: Run Discovery Commands

# Set correct subscription
az account set --subscription "<subscription-id>"
az account show

# Discover existing resources
az group list --output table
az keyvault list --output table
az network vnet list --output table

# If VNet exists, get subnet details
az network vnet subnet list `
  --resource-group "<vnet-rg>" `
  --vnet-name "<vnet-name>" `
  --output table


Phase 2: Design Decisions (2 minutes)

Step 3: Infrastructure Decisions

Resource Group: Use existing or create new?

KeyVault: Which number? (kv1=Infrastructure, kv2=Apps, etc.)

Connection Method: Public IP, Azure Bastion, or VPN?

Log Analytics: Dev/Non-Prod = No | Prod = Yes

Storage Account: Which type code? (11=Boot Diag, 21=VM Data, etc.)

Phase 3: Deployment (10-20 minutes)

Step 4: Deploy KeyVault (if needed)

# Get your user Object ID
$objectId = az ad signed-in-user show --query id --output tsv

# Deploy KeyVault
az deployment group create `
  --resource-group "<rg-name>" `
  --template-file keyvault.bicep `
  --parameters userObjectId="$objectId"


Step 5: Store Password

# Store VM password in KeyVault
az keyvault secret set `
  --vault-name "<kv-name>" `
  --name "vm-admin-password" `
  --value "<your-secure-password>"


Step 6: ✅ VALIDATE Password Retrieval

# CRITICAL: Test password retrieval before VM deployment
az keyvault secret show `
  --vault-name "<kv-name>" `
  --name "vm-admin-password" `
  --query "value" `
  --output tsv


✋ STOP: Do not proceed if password retrieval fails!

Step 7: Deploy VM

# Deploy VM with password from KeyVault
az deployment group create `
  --resource-group "<rg-name>" `
  --template-file vm.bicep `
  --parameters adminPassword=$(az keyvault secret show --vault-name "<kv-name>" --name "vm-admin-password" --query "value" --output tsv)


Step 8: ✅ VALIDATE RDP/SSH Connection

For Windows (RDP via Azure Bastion):

Go to Azure Portal

Navigate to your VM

Click "Connect" → "Bastion"

Enter credentials

Verify successful login

For Linux (SSH via Bastion):

# Similar process through Azure Portal Bastion


Phase 4: Post-Deployment (5 minutes)

Step 9: Verify Resources

# List all resources in resource group
az resource list --resource-group "<rg-name>" --output table

# Verify VM is running
az vm list --resource-group "<rg-name>" --query "[].{Name:name, Status:powerState}" --output table

# If Log Analytics enabled, verify diagnostics
az monitor diagnostic-settings list --resource "<vm-resource-id>"


Step 10: Document

Create a deployment record:

Subscription name

Resource group

KeyVault used (and number)

Storage account(s) created

VM names and purposes

Connection method

Admin username (password in KeyVault)

Quick Reference Cards

Card 1: Character Limits

┌─────────────────────────────────────────────┐
│  CRITICAL CHARACTER LIMITS                  │
├─────────────────────────────────────────────┤
│                                              │
│  Windows VM:        15 chars  ⚠️ CRITICAL   │
│  Linux VM:          64 chars                │
│  KeyVault:          24 chars                │
│  Storage Account:   24 chars                │
│  Resource Group:    90 chars                │
│  Recovery Vault:    50 chars                │
│  Virtual Network:   64 chars                │
│  NIC/Disk/PIP:      80 chars                │
│                                              │
└─────────────────────────────────────────────┘


Card 2: Naming Patterns

┌─────────────────────────────────────────────────────────────┐
│  AZURE RESOURCE NAMING - QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  KeyVault:         kv{#}{first9}-{last9}                  │
│  Example:          kv1AlignInfr-putingDev                 │
│                                                              │
│  Storage Account:  sa{type2}{first9}{last9}                 │
│  Example:          sa11aligninfrputingdev                 │
│                                                              │
│  Windows VM:       {env}{loc}{#}{func}{inst} (15 max!)     │
│  Example:          devaz1rgtapp01                           │
│                                                              │
│  NIC:              nic-{vmname}                             │
│  Example:          nic-devaz1rgtapp01                       │
│                                                              │
│  Disk (OS):        disk-{vmname}-os                         │
│  Example:          disk-devaz1rgtapp01-os                   │
│                                                              │
│  Disk (Data):      disk-{vmname}-data{##}                   │
│  Example:          disk-devaz1rgtapp01-data01               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  TYPE CODES: 11=BootDiag, 21=VMData, 31=Backup, 41=AppData │
│              51=Logs, 61=FileShares, 71=Blobs, 91=Archive  │
│  KV NUMBERS: 1=Infra, 2=Apps, 3=Region1, 4=Region2, 5+=CC  │
└─────────────────────────────────────────────────────────────┘


Card 3: Type Codes

┌────────────────────────────────────────────┐
│  STORAGE ACCOUNT TYPE CODES                │
├────────────────────────────────────────────┤
│                                             │
│  11 = Boot Diagnostics (Primary)           │
│  12 = Boot Diagnostics (Secondary)         │
│  21 = VM Data Storage                      │
│  31 = Backup/Recovery                      │
│  41 = Application Data                     │
│  51 = Log Storage                          │
│  61 = File Shares (SMB)                    │
│  71 = Blob Storage                         │
│  81 = Table/Queue                          │
│  91 = Archive/Cold Storage                 │
│                                             │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  KEYVAULT NUMBERS                          │
├────────────────────────────────────────────┤
│                                             │
│  1 = Infrastructure/Primary                │
│  2 = Application Secrets                   │
│  3 = Regional - Primary                    │
│  4 = Regional - Secondary (DR)             │
│  5 = Cost Center 1                         │
│  6 = Cost Center 2                         │
│  7 = DevOps/CI-CD                          │
│  8 = Security/Compliance                   │
│  9 = Backup/DR                             │
│                                             │
└────────────────────────────────────────────┘


Troubleshooting

Issue: "Name already exists" (Storage Account)

Problem: Storage account names are globally unique across ALL of Azure.

Solutions:

Change the type code (e.g., from 11 to 12)

Add a suffix if needed (within 24 char limit)

Check if name is reserved by another subscription

Prevention: Use the systematic pattern - collisions should be rare.

Issue: "Name too long" (Windows VM)

Problem: Windows VM names cannot exceed 15 characters.

Solutions:

Shorten environment: dev not development

Shorten function: app not application, db not database

Use single digit for instance: 1 not 01

Remove separators if you added any

Example Fix:

❌ dev-az1-rgt-application-01 (26 chars - too long!)

✅ devaz1rgtapp01 (15 chars - perfect!)

Issue: Storage Account "invalid characters"

Problem: Storage accounts only allow lowercase letters and numbers.

Solution: Remove all dashes, uppercase letters, and special characters.

Example Fix:

❌ SA11AlignInfr-putingDev (has uppercase and dash)

✅ sa11aligninfrputingdev (all lowercase, no dashes)

Issue: Can't retrieve KeyVault secret

Problem: VM deployment fails when trying to get password from KeyVault.

Solutions:

Verify KeyVault name is correct

Verify secret name is correct (case-sensitive!)

Check access policies - your account needs "Get" permission

Verify KeyVault has enabledForTemplateDeployment: true

Test Command:

az keyvault secret show `
  --vault-name "<kv-name>" `
  --name "vm-admin-password" `
  --query "value" `
  --output tsv


Issue: Subscription name extraction error

Problem: Helper functions produce incorrect names.

Solutions:

Verify subscription name has no leading/trailing spaces

Check special characters in subscription name

Verify subscription name length allows the pattern

Test:

$subName = "Align Infra ITIO Computing Dev"
$cleanName = $subName -replace '\s', ''
Write-Host "Clean name: $cleanName"
Write-Host "Length: $($cleanName.Length)"


FAQ

Q1: Can I change a resource name after creation?

A: Most Azure resources are immutable - names cannot be changed:

❌ Cannot rename: VM, Storage Account, KeyVault, VNet

✅ Can rename: Resource Group, NIC, Disk, Public IP

Solution: For immutable resources, you must:

Create new resource with correct name

Migrate data/configuration

Delete old resource

Prevention: Always validate names before deployment!

Q2: Why can't I use dashes in storage account names?

A: This is an Azure platform constraint, not our choice. Storage accounts require:

Lowercase letters (a-z)

Numbers (0-9)

NO dashes, uppercase, or special characters

This is because storage accounts create DNS names like {name}.blob.core.windows.net which have strict requirements.

Q3: Do I really need multiple KeyVaults?

A: It depends on your requirements:

Use single KeyVault (kv1) when:

Single team manages all secrets

No regional deployment needs

Simple infrastructure secrets only

Cost is primary concern

Use multiple KeyVaults when:

Multiple teams need isolated secrets (kv1, kv2)

Multi-region deployments (kv3, kv4)

Multiple cost centers need separation (kv5, kv6)

Compliance requires separate audit trails

Different RBAC policies needed

Q4: What if my subscription name is too short?

A: If subscription name is shorter than the pattern requires:

For KeyVault: kv{#}{first9}-{last9}

If name < 10 chars: Use full name twice or pad

Example: "Dev" → kv1Dev-------Dev (pad with dashes if needed)

For Storage: sa{type2}{first9}{last9}

If name < 9 chars: Use full name and pad

Example: "Test" → sa11testtest or sa11test000test

Reality: Most enterprise subscription names are 15-40 chars, so this is rarely an issue.

Q5: Can I use these patterns for Linux VMs?

A: Yes! Linux VMs have a 64-character limit (vs 15 for Windows).

Options:

Use same pattern for consistency: devaz1rgtapp01

Use longer, more descriptive names: dev-westus2-rgt-application-server-01

Recommendation: Stick with the Windows pattern for consistency across your infrastructure, even for Linux VMs.

Q6: What about resources not covered here?

A: This guide covers the most common resources. For others, follow the pattern:

General Rule:

{resourcetype-prefix}-{subscription-identity}-{purpose}


Examples:

Application Gateway: agw-AlignInfraITIOComputingDev

Load Balancer: lb-AlignInfraITIOComputingDev-web

Azure SQL: sql-AlignInfraITIOComputingDev

Cosmos DB: cosmos-AlignInfraITIOComputingDev

Check Azure limits: Microsoft Resource Naming Rules

Q7: How do I handle dev/test/prod in the same subscription?

A: This is uncommon (subscriptions usually separate environments), but if needed:

Option 1: Use VM name pattern

devaz1rgtapp01   (dev environment)
tstaz1rgtapp01   (test environment)
prdaz1rgtapp01   (prod environment)


Option 2: Use KeyVault numbers

kv1AlignInfr-putingDev  (dev secrets)
kv2AlignInfr-putingDev  (test secrets)
kv3AlignInfr-putingDev  (prod secrets)


Recommendation: Use separate subscriptions for dev/test/prod when possible.

Q8: What if I need more than 9 KeyVaults?

A: The pattern supports 1-9 KeyVaults per subscription.

If you need more:

Re-evaluate design: Why do you need 10+ KeyVaults in one subscription?

Consider subscription split: Perhaps you need multiple subscriptions

Use 2-letter codes: kva, kvb, kvc instead of numbers

Use double digits: kv01, kv02, etc. (requires reducing first/last to 9 chars each)

Reality: Needing 10+ KeyVaults in one subscription is extremely rare and usually indicates a design issue.

Q9: Can I automate this in Terraform instead of Bicep?

A: Absolutely! The naming patterns work with any IaC tool:

Terraform Example:

locals {
  subscription_name = "Align Infra ITIO Computing Dev"
  clean_sub_name    = replace(local.subscription_name, " ", "")
  first9           = substr(local.clean_sub_name, 0, 10)
  last9            = substr(local.clean_sub_name, length(local.clean_sub_name) - 10, 10)
  
  kv_name = "kv1${local.first9}-${local.last9}"
  sa_name = lower("sa11${substr(local.clean_sub_name, 0, 9)}${substr(local.clean_sub_name, length(local.clean_sub_name) - 9, 9)}")
}

resource "azurerm_key_vault" "main" {
  name = local.kv_name
  # ... rest of config
}


Q10: How do I enforce these standards across my organization?

A: Multiple approaches:

1. Azure Policy: Create policies that reject non-compliant names:

{
  "if": {
    "allOf": [
      {"field": "type", "equals": "Microsoft.KeyVault/vaults"},
      {"field": "name", "notLike": "kv[1-9]*"}
    ]
  },
  "then": {"effect": "deny"}
}


2. CI/CD Validation: Add validation step in pipelines:

# In your pipeline
Test-AzureResourceName $kvName -Type KeyVault
if (-not $?) { 
    Write-Error "Invalid KeyVault name"
    exit 1
}


3. Pull Request Templates: Require naming validation before PR approval

4. Training & Documentation: Share this wiki page with all teams

Document History

Version

Date

Author

Changes

1.0

October 2025

Dustin Winkler

Initial release - comprehensive naming standards

Related Documents

Azure Resource Naming Rules (Microsoft)

Azure Cloud Adoption Framework - Naming

Bicep Documentation

Azure CLI Reference

Support & Feedback

Questions? Contact Infrastructure Team
Found an issue? Open a ticket
Suggestions? We welcome improvements to these standards



End of Wiki