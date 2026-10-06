import json
import zipfile
import os
from normalizer import EntityNormalizer

class ADParser:
    def __init__(self, zip_path: str):
        self.zip_path = zip_path
        self.computers = []
        self.domains = []
        self.discovered_files = []

    def parse(self) -> dict:
        if not os.path.exists(self.zip_path):
            raise FileNotFoundError(f"AD Dataset ZIP file not found at: {self.zip_path}")

        with zipfile.ZipFile(self.zip_path, 'r') as zf:
            self.discovered_files = zf.namelist()
            for filename in self.discovered_files:
                if filename.endswith("computers.json"):
                    with zf.open(filename) as f:
                        data = json.load(f)
                        self._parse_computers(data)
                elif filename.endswith("domains.json"):
                    with zf.open(filename) as f:
                        data = json.load(f)
                        self._parse_domains(data)

        return {
            "discovered_files": self.discovered_files,
            "computers": self.computers,
            "domains": self.domains
        }

    def _parse_computers(self, data: dict):
        items = data.get("data", [])
        for item in items:
            props = item.get("Properties", {})
            fqdn_raw = props.get("name", "")
            sam_raw = props.get("samaccountname", "")
            norm_fqdn = EntityNormalizer.normalize_hostname(fqdn_raw)
            norm_sam = EntityNormalizer.normalize_hostname(sam_raw)

            computer_node = {
                "id": item.get("ObjectIdentifier", fqdn_raw),
                "fqdn_original": fqdn_raw,
                "fqdn_normalized": norm_fqdn["normalized"],
                "short_hostname": norm_sam["short"] or norm_fqdn["short"],
                "domain": props.get("domain", ""),
                "operating_system": props.get("operatingsystem", ""),
                "os_family": EntityNormalizer.extract_os_family(props.get("operatingsystem", "")),
                "is_dc": props.get("isdc", False),
                "enabled": props.get("enabled", True),
                "spns": props.get("serviceprincipalnames", []),
                "sessions": item.get("Sessions", {}).get("Results", []),
                "raw_properties": props
            }
            self.computers.append(computer_node)

    def _parse_domains(self, data: dict):
        items = data.get("data", [])
        for item in items:
            props = item.get("Properties", {})
            self.domains.append({
                "id": item.get("ObjectIdentifier", props.get("name")),
                "name": props.get("name"),
                "sid": props.get("domainsid")
            })
