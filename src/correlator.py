import os
import json
import csv

class EntityCorrelator:
    def __init__(self, candidate_generator, scorer, config: dict):
        self.candidate_generator = candidate_generator
        self.scorer = scorer
        self.high_thresh = config.get("thresholds", {}).get("high_confidence_threshold", 0.70)
        self.low_thresh = config.get("thresholds", {}).get("low_confidence_threshold", 0.35)

    def correlate(self) -> dict:
        candidates_map = self.candidate_generator.generate_candidates()
        matched_results = []
        ambiguous_results = []
        unmatched_results = []
        all_correlation_records = []

        method_counts = {
            "DNS": 0,
            "Hostname": 0,
            "IP": 0,
            "MAC": 0,
            "Multi-evidence": 0
        }

        for ad_id, candidate_pairs in candidates_map.items():
            # Group candidate hosts by IP address to avoid HIGH/LOW node duplication ambiguity
            ip_best_candidates = {}

            for pair in candidate_pairs:
                ad_comp = pair["ad_computer"]
                net_host = pair["network_host"]
                res = self.scorer.evaluate_candidate(ad_comp, net_host)
                host_ip = net_host.get("ip") or net_host["node_id"]

                entry = {
                    "ad_computer": ad_comp,
                    "network_host": net_host,
                    "score": res["score"],
                    "evidence": res["evidence"]
                }

                if host_ip not in ip_best_candidates or res["score"] > ip_best_candidates[host_ip]["score"]:
                    ip_best_candidates[host_ip] = entry

            evaluated_candidates = list(ip_best_candidates.values())
            evaluated_candidates.sort(key=lambda x: x["score"], reverse=True)

            ad_comp_name = candidate_pairs[0]["ad_computer"]["fqdn_original"]

            if not evaluated_candidates or evaluated_candidates[0]["score"] < self.low_thresh:
                status = "UNMATCHED"
                record = {
                    "ad_computer": ad_comp_name,
                    "network_host": None,
                    "network_node_id": None,
                    "status": status,
                    "correlation_method": "None",
                    "confidence_score": 0.0,
                    "evidence": ["No candidates passed minimum score threshold"]
                }
                unmatched_results.append(record)
                all_correlation_records.append(record)
            else:
                top = evaluated_candidates[0]
                second_score = evaluated_candidates[1]["score"] if len(evaluated_candidates) > 1 else 0.0

                if top["score"] >= self.high_thresh and (top["score"] - second_score >= 0.15 or second_score < self.low_thresh):
                    status = "MATCHED"
                    method = "Multi-evidence"
                    for ev in top["evidence"]:
                        if "DNS match" in ev:
                            method = "DNS"
                            break
                        elif "Fuzzy name match" in ev:
                            method = "Hostname"
                            break

                    method_counts[method] = method_counts.get(method, 0) + 1

                    record = {
                        "ad_computer": ad_comp_name,
                        "network_host": top["network_host"]["ip"],
                        "network_node_id": top["network_host"]["node_id"],
                        "status": status,
                        "correlation_method": method,
                        "confidence_score": top["score"],
                        "evidence": top["evidence"]
                    }
                    matched_results.append(record)
                    all_correlation_records.append(record)
                else:
                    status = "AMBIGUOUS"
                    record = {
                        "ad_computer": ad_comp_name,
                        "network_host": top["network_host"]["ip"],
                        "network_node_id": top["network_host"]["node_id"],
                        "status": status,
                        "correlation_method": "Ambiguous",
                        "confidence_score": top["score"],
                        "evidence": top["evidence"] + [f"Ambiguous match with 2nd candidate score {second_score}"]
                    }
                    ambiguous_results.append(record)
                    all_correlation_records.append(record)

        summary = {
            "total_ad_computers": len(candidates_map),
            "total_network_hosts": len(self.candidate_generator.network_hosts),
            "matched_count": len(matched_results),
            "ambiguous_count": len(ambiguous_results),
            "unmatched_count": len(unmatched_results),
            "method_counts": method_counts
        }

        return {
            "summary": summary,
            "all_records": all_correlation_records,
            "matched": matched_results,
            "ambiguous": ambiguous_results,
            "unmatched": unmatched_results
        }

    @staticmethod
    def export_reports(results: dict, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)

        json_path = os.path.join(output_dir, "correlation_results.json")
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2)

        csv_path = os.path.join(output_dir, "correlation_results.csv")
        fieldnames = ["ad_computer", "network_host", "network_node_id", "status", "correlation_method", "confidence_score", "evidence"]
        with open(csv_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for rec in results["all_records"]:
                r = dict(rec)
                r["evidence"] = " | ".join(r["evidence"])
                writer.writerow(r)

        unmatched_path = os.path.join(output_dir, "unmatched_ad_computers.csv")
        with open(unmatched_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for rec in results["unmatched"]:
                r = dict(rec)
                r["evidence"] = " | ".join(r["evidence"])
                writer.writerow(r)

        ambiguous_path = os.path.join(output_dir, "ambiguous_matches.csv")
        with open(ambiguous_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for rec in results["ambiguous"]:
                r = dict(rec)
                r["evidence"] = " | ".join(r["evidence"])
                writer.writerow(r)
