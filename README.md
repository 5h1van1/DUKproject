# Identity-Aware Network Attack Graph Integration

An automated security research framework that ingests **Active Directory datasets** (SharpHound ZIP) and **Network Attack Graphs** (JSON), correlates entities belonging to the same machines using multi-evidence confidence scoring, fuses the graphs via `RUNS_ON` and `HOSTS_IDENTITY` relationships, infers identity-aware attack paths, and exports the results to CSV, JSON, and BloodHound CE / Neo4j formats.

---

## Table of Contents
1. [System Functionality & Roadmap](#system-functionality--roadmap)
2. [Implemented Components](#implemented-components)
3. [Implementation & Technical Mechanics](#implementation--technical-mechanics)
4. [How to Run the System](#how-to-run-the-system)
5. [Outputs & Artifacts](#outputs--artifacts)

---

## System Functionality & Roadmap

```
  +----------------------+      +-----------------------------+
  |  AD / SharpHound ZIP |      | Network Attack Graph (JSON) |
  +----------+-----------+      +--------------+--------------+
             |                                 |
             v                                 v
     [ AD Parser ]                    [ Network Parser ]
             |                                 |
             +----------------+----------------+
                              |
                              v
                   [ Normalizer Engine ]
                              |
                              v
                    [ Candidate Generator ]
                              |
                              v
                  [ DNS & Scorer Engine ]
                              |
                              v
                 [ Match Classification ]
                 (MATCHED/AMBIGUOUS/UNMATCHED)
                              |
                              v
                   [ Graph Fusion Engine ]
                (Generates RUNS_ON edges)
                              |
           +------------------+------------------+
           |                                     |
           v                                     v
[ Attack Inference & Reachability ]   [ BloodHound / Neo4j Exporter ]
(Calculates all simple attack paths)   (Exports bloodhound_fused_graph.json)
```

---

## Implemented Components

1. **`src/normalizer.py`**: Standardizes FQDNs, short hostnames, IPv4/v6 addresses, MAC addresses, and Operating System families (`windows`, `linux`, `other`).
2. **`src/ad_parser.py`**: Extracts computer nodes, domain containers, SPNs, and user sessions from SharpHound ZIP archives (`computers.json`, `domains.json`).
3. **`src/network_parser.py`**: Parses Network Hosts (`asset`), Vulnerabilities (`cve`), Security Misconfigurations (`misconfiguration`), and network reachability edges.
4. **`src/dns_resolver.py`**: Resolves FQDNs/hostnames using `dnspython`, system socket API, or configurable offline host mappings (`correlation_config.yaml`).
5. **`src/candidate_generator.py`**: Groups network host nodes by physical IP and forms evaluation candidate pairs with AD computers.
6. **`src/scoring.py`**: Evaluates multi-evidence scoring weights (DNS match, fuzzy hostname match, OS family compatibility, SPN service alignment).
7. **`src/correlator.py`**: Ranks candidates, enforces configurable confidence thresholds, classifies matches (`MATCHED`, `AMBIGUOUS`, `UNMATCHED`), and generates CSV/JSON reports.
8. **`src/graph_fusion.py`**: Merges AD and Network subgraphs in NetworkX, creating `RUNS_ON` and `HOSTS_IDENTITY` edges.
9. **`src/bloodhound_exporter.py`**: Formats the fused graph into BloodHound CE / Neo4j-compatible JSON schema.
10. **`src/attack_inference.py`**: Infers identity exposure edges (`EXPOSES_IDENTITY_OF`, `THREATENS_DOMAIN_CONTROLLER`).
11. **`src/reachability.py`**: Calculates all simple attack paths from entry point sources to high-value targets (Domain Controllers, AD Computers).
12. **`src/experiment_runner.py`**: Conducts comparative evaluations across 4 correlation strategies (Hostname-only, Hostname+DNS, No OS penalty, Multi-evidence).
13. **`src/visualizer_server.js`**: Interactive web dashboard (`http://localhost:3000/`) with click-to-highlight path step visualization.

---

## Implementation & Technical Mechanics

### 1. Multi-Evidence Scoring Formula

$$\text{Score} = w_{\text{dns}} \cdot S_{\text{dns}} + w_{\text{name}} \cdot S_{\text{name}} + w_{\text{os}} \cdot S_{\text{os}} + w_{\text{spn}} \cdot S_{\text{spn}}$$

Where:
- $w_{\text{dns}} = 0.70$: Applied when FQDN/Hostname resolves to the Network Host IP via DNS.
- $w_{\text{name}} = 0.15$: Applied based on fuzzy string sequence similarity between AD hostname and network asset label.
- $w_{\text{os}} = 0.10$: Applied when AD OS family matches Network Host OS family (e.g., Windows == Windows). A penalty ($-0.45$) is applied if AD OS is Windows while Network OS is Linux.
- $w_{\text{spn}} = 0.05$: Applied when Active Directory SPNs (`TERMSRV`, `WSMAN`, `ldap`) align with Windows service protocols.

### 2. Match Classification Rules
- **MATCHED**: Top score $\ge 0.70$ and (top score - 2nd top score $\ge 0.15$ or 2nd score $< 0.35$).
- **AMBIGUOUS**: Top score $\ge 0.35$ but 2nd candidate score is within $0.15$ of the top candidate.
- **UNMATCHED**: Top candidate score $< 0.35$.

---

## How to Run the System

### 1. Requirements & Dependencies
Ensure Python 3.8+ and Node.js are installed.

Install Python dependencies:
```bash
pip install networkx pyyaml dnspython
```

### 2. Run Main Pipeline
To parse inputs, correlate entities, fuse graphs, infer attack paths, and export reports:

```bash
python src/main.py --ad input/AD_dataset.zip --network input/network_attack_graph.json --output outputs/
```

### 3. Run Pipeline with Experimental Comparison (Section 20)
To benchmark 4 different correlation algorithms:

```bash
python src/main.py --ad input/AD_dataset.zip --network input/network_attack_graph.json --output outputs/ --experiment
```

### 4. Launch Interactive Web Visualizer
To view all 328 discovered attack paths in an interactive browser visualizer:

```bash
node src/visualizer_server.js
```
Then open: **[http://localhost:3000/](http://localhost:3000/)**

---

## Outputs & Artifacts

| Output File | Description |
| :--- | :--- |
| `outputs/correlation_results.csv` | Full CSV report of entity correlations, scores, and evidence chains. |
| `outputs/correlation_results.json` | Structured JSON report of correlation metrics and match classifications. |
| `outputs/unmatched_ad_computers.csv` | List of unmatched AD computers requiring manual verification. |
| `outputs/ambiguous_matches.csv` | List of ambiguous matches with secondary candidate scores. |
| `outputs/fused_attack_graph.json` | Fused NetworkX attack graph JSON model. |
| `outputs/bloodhound_fused_graph.json` | **BloodHound CE / Neo4j importable JSON file**. |
| `outputs/all_attack_paths.csv` | CSV breakdown of all simple attack paths from sources to victims. |
| `outputs/all_attack_paths.json` | Step-by-step path sequence JSON detailing intermediate hops and edge metadata. |
