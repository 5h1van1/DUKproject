import json
import os
from normalizer import EntityNormalizer

class NetworkParser:
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.hosts = []
        self.cves = []
        self.misconfigurations = []
        self.edges = []

    def parse(self) -> dict:
        if not os.path.exists(self.json_path):
            raise FileNotFoundError(f"Network attack graph JSON file not found at: {self.json_path}")

        with open(self.json_path, 'r') as f:
            data = json.load(f)

        combined = data.get("combined_conditions", {})
        raw_nodes = combined.get("nodes", [])
        raw_edges = combined.get("edges", [])

        host_dict = {}

        for node_id, attrs in raw_nodes:
            node_type = attrs.get("node_type", "asset")
            if node_type == "asset":
                ip_raw = attrs.get("ip")
                norm_ip = EntityNormalizer.normalize_ip(ip_raw)
                mac_raw = attrs.get("mac")
                norm_mac = EntityNormalizer.normalize_mac(mac_raw)
                asset_label = attrs.get("asset", "")
                os_family = EntityNormalizer.extract_os_family(asset_label)

                host_entry = {
                    "node_id": node_id,
                    "ip": norm_ip["normalized"],
                    "ip_original": ip_raw,
                    "asset_label": asset_label,
                    "cpe": attrs.get("cpe"),
                    "mac_original": mac_raw,
                    "mac_normalized": norm_mac["normalized"],
                    "os_family": os_family,
                    "initial_condition": attrs.get("initial_condition"),
                    "vulnerabilities": [],
                    "misconfigurations": [],
                    "raw_attrs": attrs
                }
                host_dict[node_id] = host_entry
                self.hosts.append(host_entry)
            elif node_type == "cve":
                self.cves.append({
                    "node_id": node_id,
                    "cve_id": attrs.get("cve_id"),
                    "cve_score": attrs.get("cve_score"),
                    "ip": attrs.get("ip"),
                    "port": attrs.get("port"),
                    "raw_attrs": attrs
                })
            elif node_type == "misconfiguration":
                self.misconfigurations.append({
                    "node_id": node_id,
                    "misconf_name": attrs.get("misconf_name"),
                    "risk_factor": attrs.get("risk_factor"),
                    "ip": attrs.get("ip"),
                    "port": attrs.get("port"),
                    "raw_attrs": attrs
                })

        for src, dst, edge_attrs in raw_edges:
            self.edges.append({
                "source": src,
                "target": dst,
                "connection": edge_attrs.get("connection"),
                "service_port": edge_attrs.get("service_port"),
                "raw_attrs": edge_attrs
            })

        return {
            "hosts": self.hosts,
            "cves": self.cves,
            "misconfigurations": self.misconfigurations,
            "edges": self.edges
        }
