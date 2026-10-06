import networkx as nx
import json
import csv
import os

class ComprehensivePathAnalyzer:
    def __init__(self, fused_graph: nx.DiGraph, max_path_length: int = 10):
        self.fused_graph = fused_graph
        self.max_path_length = max_path_length

    def find_all_attack_sources(self) -> list:
        sources = []
        for n, d in self.fused_graph.nodes(data=True):
            node_type = d.get("type", "")
            if node_type == "NetworkHost" and d.get("initial_condition") == "YES":
                sources.append((n, f"Initial Compromised Host ({d.get('ip')})"))
            elif d.get("initial_condition") == "YES":
                sources.append((n, "Initial Compromised Node"))

        if not sources:
            for n, d in self.fused_graph.nodes(data=True):
                if d.get("type") == "NetworkHost":
                    sources.append((n, f"Network Host Candidate ({d.get('ip')})"))
        return sources

    def find_all_victim_targets(self) -> list:
        victims = []
        for n, d in self.fused_graph.nodes(data=True):
            node_type = d.get("type", "")
            if node_type == "ADComputer" and d.get("is_dc") is True:
                victims.append((n, f"Domain Controller ({n})"))
            elif node_type == "ADDomain":
                victims.append((n, f"AD Domain ({n})"))
            elif node_type == "ADComputer":
                victims.append((n, f"AD Computer ({n})"))
            elif node_type == "NetworkHost" and d.get("impact", 0) > 0:
                victims.append((n, f"High Impact Host ({d.get('ip')})"))
        return victims

    def find_all_paths(self) -> dict:
        sources = self.find_all_attack_sources()
        victims = self.find_all_victim_targets()

        all_paths_report = []
        summary_stats = {
            "total_sources_evaluated": len(sources),
            "total_victims_evaluated": len(victims),
            "total_paths_found": 0,
            "paths_to_dc_count": 0,
            "paths_by_source": {}
        }

        for src_id, src_label in sources:
            src_paths_count = 0
            for victim_id, victim_label in victims:
                if src_id == victim_id:
                    continue

                if nx.has_path(self.fused_graph, src_id, victim_id):
                    # Compute simple paths up to cutoff length
                    try:
                        paths_gen = nx.all_simple_paths(
                            self.fused_graph,
                            source=src_id,
                            target=victim_id,
                            cutoff=self.max_path_length
                        )
                        for p in paths_gen:
                            src_paths_count += 1
                            summary_stats["total_paths_found"] += 1
                            is_dc_target = "Domain Controller" in victim_label
                            if is_dc_target:
                                summary_stats["paths_to_dc_count"] += 1

                            # Construct step-by-step path details
                            path_steps = []
                            for idx in range(len(p) - 1):
                                u, v = p[idx], p[idx+1]
                                u_type = self.fused_graph.nodes[u].get("type", "Unknown")
                                v_type = self.fused_graph.nodes[v].get("type", "Unknown")
                                edge_data = self.fused_graph.get_edge_data(u, v, default={})
                                rel = edge_data.get("relationship") or edge_data.get("connection") or "LINKED_TO"
                                path_steps.append({
                                    "step": idx + 1,
                                    "from_node": u,
                                    "from_type": u_type,
                                    "relationship": rel,
                                    "to_node": v,
                                    "to_type": v_type,
                                    "metadata": edge_data
                                })

                            all_paths_report.append({
                                "path_id": summary_stats["total_paths_found"],
                                "source_node": src_id,
                                "source_label": src_label,
                                "target_node": victim_id,
                                "target_label": victim_label,
                                "hop_length": len(p) - 1,
                                "path_nodes": p,
                                "path_steps": path_steps
                            })
                    except Exception:
                        pass

            summary_stats["paths_by_source"][src_id] = src_paths_count

        return {
            "summary": summary_stats,
            "paths": all_paths_report
        }

    @staticmethod
    def export_reports(paths_data: dict, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)

        # 1. Export JSON
        json_path = os.path.join(output_dir, "all_attack_paths.json")
        with open(json_path, 'w') as f:
            json.dump(paths_data, f, indent=2)

        # 2. Export CSV
        csv_path = os.path.join(output_dir, "all_attack_paths.csv")
        fieldnames = ["path_id", "source_node", "source_label", "target_node", "target_label", "hop_length", "path_node_sequence", "step_details"]
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for p in paths_data["paths"]:
                step_str = " -> ".join([f"[{s['from_node']}]--({s['relationship']})-->[{s['to_node']}]" for s in p["path_steps"]])
                writer.writerow({
                    "path_id": p["path_id"],
                    "source_node": p["source_node"],
                    "source_label": p["source_label"],
                    "target_node": p["target_node"],
                    "target_label": p["target_label"],
                    "hop_length": p["hop_length"],
                    "path_node_sequence": " -> ".join(p["path_nodes"]),
                    "step_details": step_str
                })

class ReachabilityAnalyzer:
    def __init__(self, fused_graph: nx.DiGraph):
        self.fused_graph = fused_graph

    def analyze(self) -> dict:
        path_analyzer = ComprehensivePathAnalyzer(self.fused_graph)
        return path_analyzer.find_all_paths()
