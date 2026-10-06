import json
import networkx as nx

class GraphFusionEngine:
    def __init__(self, ad_data: dict, network_data: dict, correlation_results: dict):
        self.ad_data = ad_data
        self.network_data = network_data
        self.correlation_results = correlation_results
        self.fused_graph = nx.DiGraph()

    def fuse(self) -> nx.DiGraph:
        # 1. Add AD Nodes & Container Relationships
        for computer in self.ad_data.get("computers", []):
            node_id = computer["fqdn_original"]
            self.fused_graph.add_node(node_id, type="ADComputer", **computer)
            domain_id = computer.get("domain")
            if domain_id:
                self.fused_graph.add_edge(node_id, domain_id, relationship="MEMBER_OF_DOMAIN")

        for domain in self.ad_data.get("domains", []):
            node_id = domain["name"]
            self.fused_graph.add_node(node_id, type="ADDomain", **domain)

        # 2. Add Network Nodes
        for host in self.network_data.get("hosts", []):
            node_id = host["node_id"]
            self.fused_graph.add_node(node_id, type="NetworkHost", **host)

        for cve in self.network_data.get("cves", []):
            node_id = cve["node_id"]
            self.fused_graph.add_node(node_id, type="CVE", **cve)

        for misconf in self.network_data.get("misconfigurations", []):
            node_id = misconf["node_id"]
            self.fused_graph.add_node(node_id, type="Misconfiguration", **misconf)

        # 3. Add Existing Network Edges
        for edge in self.network_data.get("edges", []):
            self.fused_graph.add_edge(edge["source"], edge["target"], **edge)

        # 4. Add Correlated RUNS_ON & HOSTS_IDENTITY Edges
        for record in self.correlation_results.get("matched", []):
            ad_node = record["ad_computer"]
            net_node = record["network_node_id"]
            if ad_node in self.fused_graph and net_node in self.fused_graph:
                # ADComputer RUNS_ON NetworkHost
                self.fused_graph.add_edge(
                    ad_node,
                    net_node,
                    relationship="RUNS_ON",
                    correlation_method=record["correlation_method"],
                    confidence_score=record["confidence_score"],
                    evidence=record["evidence"]
                )
                # NetworkHost HOSTS_IDENTITY ADComputer (attack flow direction)
                self.fused_graph.add_edge(
                    net_node,
                    ad_node,
                    relationship="HOSTS_IDENTITY",
                    correlation_method=record["correlation_method"],
                    confidence_score=record["confidence_score"],
                    evidence=record["evidence"]
                )

        return self.fused_graph

    def export_json(self, output_file: str):
        graph_data = nx.node_link_data(self.fused_graph)
        with open(output_file, 'w') as f:
            json.dump(graph_data, f, indent=2)
