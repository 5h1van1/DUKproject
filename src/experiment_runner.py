import time
import json
import copy

from ad_parser import ADParser
from network_parser import NetworkParser
from dns_resolver import DNSResolver
from candidate_generator import CandidateGenerator
from scoring import CandidateScorer
from correlator import EntityCorrelator

def run_experiments(ad_file: str, network_file: str, base_config: dict) -> dict:
    ad_parser = ADParser(ad_file)
    ad_data = ad_parser.parse()

    net_parser = NetworkParser(network_file)
    net_data = net_parser.parse()

    experiments = [
        {
            "id": "Exp1",
            "name": "Hostname-Only Correlation",
            "weights": {"dns_match_weight": 0.0, "hostname_fuzzy_match_weight": 0.90, "os_match_weight": 0.10, "spn_service_match_weight": 0.0}
        },
        {
            "id": "Exp2",
            "name": "Hostname + DNS Correlation",
            "weights": {"dns_match_weight": 0.70, "hostname_fuzzy_match_weight": 0.30, "os_match_weight": 0.0, "spn_service_match_weight": 0.0}
        },
        {
            "id": "Exp3",
            "name": "Hostname + DNS + IP (No OS Penalty)",
            "weights": {"dns_match_weight": 0.80, "hostname_fuzzy_match_weight": 0.20, "os_match_weight": 0.0, "spn_service_match_weight": 0.0}
        },
        {
            "id": "Exp4",
            "name": "Multi-Evidence Confidence Scoring",
            "weights": {"dns_match_weight": 0.70, "hostname_fuzzy_match_weight": 0.15, "os_match_weight": 0.10, "spn_service_match_weight": 0.05}
        }
    ]

    results_comparison = []

    for exp in experiments:
        cfg = copy.deepcopy(base_config)
        cfg["scoring_weights"] = exp["weights"]

        dns_settings = cfg.get("dns_settings", {})
        dns_resolver = DNSResolver(
            fallback_mapping=dns_settings.get("fallback_mapping", {}),
            use_system_dns=dns_settings.get("use_system_dns", False)
        )

        candidate_gen = CandidateGenerator(ad_data["computers"], net_data["hosts"])
        scorer = CandidateScorer(cfg, dns_resolver)
        correlator = EntityCorrelator(candidate_gen, scorer, cfg)

        start_time = time.time()
        res = correlator.correlate()
        elapsed_ms = (time.time() - start_time) * 1000.0

        summary = res["summary"]
        results_comparison.append({
            "experiment_id": exp["id"],
            "experiment_name": exp["name"],
            "matched": summary["matched_count"],
            "ambiguous": summary["ambiguous_count"],
            "unmatched": summary["unmatched_count"],
            "execution_time_ms": round(elapsed_ms, 3)
        })

    return {"experiments": results_comparison}
