from difflib import SequenceMatcher

class CandidateScorer:
    def __init__(self, config: dict, dns_resolver):
        self.weights = config.get("scoring_weights", {
            "dns_match_weight": 0.70,
            "hostname_fuzzy_match_weight": 0.15,
            "os_match_weight": 0.10,
            "spn_service_match_weight": 0.05
        })
        self.thresholds = config.get("thresholds", {
            "high_confidence_threshold": 0.70,
            "low_confidence_threshold": 0.35
        })
        self.dns_resolver = dns_resolver

    def evaluate_candidate(self, ad_comp: dict, net_host: dict) -> dict:
        score = 0.0
        evidence = []

        # 1. DNS Resolution Match
        fqdn = ad_comp.get("fqdn_original", "")
        dns_res = self.dns_resolver.resolve(fqdn)
        net_ip = net_host.get("ip")

        if dns_res["success"] and net_ip in dns_res["resolved_ips"]:
            dns_weight = self.weights.get("dns_match_weight", 0.70)
            score += dns_weight
            evidence.append(f"DNS match: {fqdn} resolved to {net_ip} (method: {dns_res['method']})")

        # 2. Hostname / Asset Label Fuzzy Match
        ad_name = ad_comp.get("short_hostname", "").lower()
        net_asset = net_host.get("asset_label", "").lower()
        if ad_name and net_asset:
            ratio = SequenceMatcher(None, ad_name, net_asset).ratio()
            fuzzy_weight = self.weights.get("hostname_fuzzy_match_weight", 0.15)
            added_fuzzy = ratio * fuzzy_weight
            score += added_fuzzy
            if ratio > 0.4:
                evidence.append(f"Fuzzy name match between '{ad_name}' and '{net_asset}' (ratio: {ratio:.2f})")

        # 3. OS Family Alignment
        ad_os_family = ad_comp.get("os_family", "unknown")
        net_os_family = net_host.get("os_family", "unknown")
        if ad_os_family != "unknown" and net_os_family != "unknown":
            if ad_os_family == net_os_family:
                os_weight = self.weights.get("os_match_weight", 0.10)
                score += os_weight
                evidence.append(f"OS family match: Both are '{ad_os_family}' ({ad_comp.get('operating_system')} vs {net_host.get('asset_label')})")
            else:
                score = max(0.0, score - 0.45)
                evidence.append(f"OS family mismatch penalty: AD='{ad_os_family}' vs Net='{net_os_family}'")

        # 4. SPN vs Service Match
        spns = [s.lower() for s in ad_comp.get("spns", [])]
        if any("termsrv" in s or "host" in s or "wsman" in s or "ldap" in s for s in spns):
            if net_os_family == "windows":
                spn_weight = self.weights.get("spn_service_match_weight", 0.05)
                score += spn_weight
                evidence.append("Windows SPN presence aligned with Windows Network Host")

        score = min(1.0, max(0.0, score))

        return {
            "score": round(score, 4),
            "evidence": evidence
        }
