import json
import networkx as nx

class BloodHoundExporter:
    def __init__(self, fused_graph: nx.DiGraph):
        self.fused_graph = fused_graph

    def export_bloodhound_json(self, output_file: str):
        nodes = []
        edges = []

        for node_id, data in self.fused_graph.nodes(data=True):
            node_type = data.get("type", "Unknown")
            cleaned_props = {}
            for k, v in data.items():
                if isinstance(v, (str, int, float, bool)) or v is None:
                    cleaned_props[k] = v
                elif isinstance(v, list):
                    cleaned_props[k] = [str(x) for x in v]
                else:
                    cleaned_props[k] = str(v)

            nodes.append({
                "id": node_id,
                "label": node_type,
                "properties": cleaned_props
            })

        for src, dst, data in self.fused_graph.edges(data=True):
            rel = data.get("relationship") or data.get("connection") or "CONNECTED_TO"
            cleaned_props = {}
            for k, v in data.items():
                if isinstance(v, (str, int, float, bool)) or v is None:
                    cleaned_props[k] = v
                elif isinstance(v, list):
                    cleaned_props[k] = [str(x) for x in v]
                else:
                    cleaned_props[k] = str(v)

            edges.append({
                "source": src,
                "target": dst,
                "label": rel,
                "properties": cleaned_props
            })

        bloodhound_export = {
            "meta": {
                "version": 6,
                "type": "FusedIdentityNetworkAttackGraph",
                "collector": "IdentityAwareNetworkAttackGraphFusionEngine"
            },
            "nodes": nodes,
            "edges": edges
        }

        with open(output_file, 'w') as f:
            json.dump(bloodhound_export, f, indent=2)

        return bloodhound_export
