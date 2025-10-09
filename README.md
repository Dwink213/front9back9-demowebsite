# Front9/Back9 Algorithm - Azure Resource Naming

**Live Demo:** https://lemon-pebble-067db5b0f.2.azurestaticapps.net/
A subscription-scoped naming convention for Azure resources that solves the challenge of inconsistent resource type constraints.

---

## The Problem

Azure enforces different naming rules for each resource type:

| Resource Type | Max Length | Constraints |
|--------------|------------|-------------|
| Virtual Machine | 15 chars | NetBIOS/AD computer name limit |
| KeyVault | 24 chars | Alphanumeric, hyphens, must start with letter |
| Storage Account | 24 chars | Lowercase letters and numbers only |
| Resource Group | 90 chars | Alphanumeric, underscores, hyphens, periods |

Traditional naming conventions either:
- Use random GUIDs (unreadable: `kv-a3f7b2e9-3c4d`)
- Break at scale (collisions across subscriptions)
- Sacrifice context for brevity

---

## The Solution: Front9/Back9 Algorithm

Extract subscription identity algorithmically and adapt it to each resource type's constraints.

### How It Works

**Input:** Azure Subscription Name
```
"Your Long Company Name Production Services"
```

**Step 1:** Clean (remove spaces/special chars)
```
"YourLongCompanyNameProductionServices"
```

**Step 2:** Extract Identity
```
Front9: "YourLongC"  (first 9 characters)
Back9:  "nServices"  (last 9 characters)
```

**Step 3:** Apply to Resource Types
```
Resource Group:   rg1-YourLongCompanyNameP-VM-ductionServices (45/90 chars)
KeyVault:         kv1YourLongC-nServices                      (22/24 chars)
Storage Account:  sa11yourlongcnservices                      (22/24 chars)
VM:               prdaz2mfgapp01                              (14/15 chars)
NIC:              nic-prdaz2mfgapp01-01                       (21/80 chars)
OS Disk:          disk-prdaz2mfgapp01-os                      (22/80 chars)
Data Disk:        disk-prdaz2mfgapp01-data                    (24/80 chars)
```

---

## Key Benefits

✅ **Globally unique** - Subscription name ensures uniqueness  
✅ **Human readable** - No random strings or GUIDs  
✅ **Automation friendly** - Programmatically generate names  
✅ **Constraint adaptive** - Works within each resource type's limits  
✅ **No external config** - No database of naming rules needed  

---

## Design Principles

### 1. No Region in Subscription Names
**DON'T:** "Company Production East" → Creates confusion  
**DO:** "Company Production Services" → Clean extraction

Subscription-scoped resources (RG, KV, SA) serve multiple regions. Putting "East" in the subscription name implies a regional restriction that doesn't exist.

### 2. Region Only in VM Names
VMs are physically located in a specific datacenter, so region codes (az1/az2/az3) belong in VM names. All dependent resources (NIC, Disks) inherit the VM name pattern.

### 3. Subscription Identity, Not Random Strings
The Front9/Back9 extraction ensures uniqueness without sacrificing readability.

---

## Usage

### Web Demo (No Installation)
1. Visit: https://calm-sand-0f158ae10.2.azurestaticapps.net
2. Enter your Azure subscription name
3. Click "Generate Names"
4. Export results as CSV

### Local Development
```bash
git clone https://github.com/Dwink213/front9back9-azure-naming.git
cd front9back9-azure-naming
open index.html
```

---

## Roadmap

### ✅ Phase 1: Algorithm Demo (Current)
- Single-page HTML demo
- Name generation and validation
- CSV export

### 🚧 Phase 2: Bicep Template Generator (Coming Soon)
- Multi-page wizard
- Download working Bicep templates
- Pre-deployment validation

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Author

**Dustin Winkler**

- GitHub: [@Dwink213](https://github.com/Dwink213)
- LinkedIn: [dustin-winkler-nc](https://www.linkedin.com/in/dustin-winkler-nc/)
