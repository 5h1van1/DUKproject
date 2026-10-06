import networkx as nx

class AttackInferenceEngine:
    def __init__(self, fused_graph: nx.DiGraph):
        self.fused_graph = fused_graph

    def infer_attack_paths(self) -> dict:
        inferred_edges = []
        exposed_entities = []

        # Find entry point hosts or vulnerable hosts
        vulnerable_hosts = []
        for node_id, data in self.fused_graph.nodes(data=True):
            if data.get("type") == "NetworkHost":
                if data.get("initial_condition") == "YES":
                    vulnerable_hosts.append((node_id, "Entry Point Host (Initial Condition YES)"))
                else:
                    # Check attached CVEs
                    for neighbor in self.fused_graph.neighbors(node_id):
                        n_data = self.fused_graph.nodes[neighbor]
                        if n_data.get("type") == "CVE" and float(n_data.get("cve_score", 0)) >= 9.0:
                            vulnerable_hosts.append((node_id, f"Vulnerable to Critical CVE {n_data.get('cve_id')}"))
                            break

        # Apply Inference Rule 1 & 2 across RUNS_ON edges
        for host_id, reason in vulnerable_hosts:
            # Find incoming or outgoing RUNS_ON edges
            ad_computers = []
            for u, v, edata in self.fused_graph.edges(data=True):
                if v == host_id and edata.get("relationship") == "RUNS_ON":
                    ad_computers.append(u)

            for ad_comp in ad_computers:
                comp_data = self.fused_graph.nodes[ad_comp]
                is_dc = comp_data.get("is_dc", False)

                # Inferred attack link: Compromised NetworkHost -> Threatens AD Computer
                rel_name = "EXPOSES_IDENTITY_OF" if not is_dc else "THREATENS_DOMAIN_CONTROLLER"
                inferred_edge = {
                    "source": host_id,
                    "target": ad_comp,
                    "relationship": rel_name,
                    "inference_rule": "Rule 1: Compromised Host to AD Entity Exposure",
                    "evidence_chain": [reason, f"RUNS_ON link from {ad_comp} to {host_id}"]
                }
                inferred_edges.append(inferred_edge)

                exposed_entities.append({
                    "entity": ad_comp,
                    "entity_type": "ADComputer",
                    "is_dc": is_dc,
                    "threat_source_host": host_id,
                    "reason": reason
                })

        return {
            "inferred_edges": inferred_edges,
            "exposed_entities": exposed_entities
        }
