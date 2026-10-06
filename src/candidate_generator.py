class CandidateGenerator:
    def __init__(self, ad_computers: list, network_hosts: list):
        self.ad_computers = ad_computers
        self.network_hosts = network_hosts

    def generate_candidates(self) -> dict:
        candidates_map = {}
        for ad_comp in self.ad_computers:
            ad_id = ad_comp["id"]
            candidates_map[ad_id] = []
            for net_host in self.network_hosts:
                candidate_pair = {
                    "ad_computer": ad_comp,
                    "network_host": net_host
                }
                candidates_map[ad_id].append(candidate_pair)
        return candidates_map
