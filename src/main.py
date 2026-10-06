import argparse
import os
import yaml
import json
import sys

from ad_parser import ADParser
from network_parser import NetworkParser
from dns_resolver import DNSResolver
from candidate_generator import CandidateGenerator
from scoring import CandidateScorer
from correlator import EntityCorrelator
from graph_fusion import GraphFusionEngine
from bloodhound_exporter import BloodHoundExporter
from attack_inference import AttackInferenceEngine
from reachability import ReachabilityAnalyzer, ComprehensivePathAnalyzer
from experiment_runner import run_experiments

def load_config(config_path: str) -> dict:
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return yaml.safe_load(f) or {}
    return {}

def main():
    parser = argparse.ArgumentParser(description="Identity-Aware Network Attack Graph Integration Pipeline")
    parser.add_argument("--ad", required=True, help="Path to AD SharpHound ZIP file")
    parser.add_argument("--network", required=True, help="Path to Network Attack Graph JSON file")
    parser.add_argument("--config", default="config/correlation_config.yaml", help="Path to correlation config file")
    parser.add_argument("--output", default="outputs/", help="Directory to save output files")
    parser.add_argument("--experiment", action="store_true", help="Run experimental comparisons across correlation methods")
    args = parser.parse_args()

    print("==================================================================")
    print("      IDENTITY-AWARE NETWORK ATTACK GRAPH INTEGRATION PIPELINE    ")
    print("==================================================================")

    # 1. Load Config
    config = load_config(args.config)

    # 2. Parse AD Data
    print(f"[+] STEP 1: Parsing Active Directory Dataset: {args.ad}")
    ad_parser = ADParser(args.ad)
    ad_data = ad_parser.parse()
    print(f"    - Discovered AD files: {', '.join(ad_data['discovered_files'])}")
    print(f"    - Extracted AD Computers: {len(ad_data['computers'])}")

    # 3. Parse Network Attack Graph Data
    print(f"[+] STEP 2: Parsing Network Attack Graph: {args.network}")
    net_parser = NetworkParser(args.network)
    net_data = net_parser.parse()
    print(f"    - Extracted Network Hosts: {len(net_data['hosts'])}")
    print(f"    - Extracted CVEs: {len(net_data['cves'])}")
    print(f"    - Extracted Misconfigurations: {len(net_data['misconfigurations'])}")
    print(f"    - Extracted Edges: {len(net_data['edges'])}")

    # 4. Initialize DNS Resolver & Scorer
    dns_settings = config.get("dns_settings", {})
    dns_resolver = DNSResolver(
        fallback_mapping=dns_settings.get("fallback_mapping", {}),
        use_system_dns=dns_settings.get("use_system_dns", False)
    )

    candidate_gen = CandidateGenerator(ad_data["computers"], net_data["hosts"])
    scorer = CandidateScorer(config, dns_resolver)
    correlator = EntityCorrelator(candidate_gen, scorer, config)

    # 5. Run Entity Correlation
    print("[+] STEP 3: Executing AD <-> Network Entity Correlation...")
    correlation_results = correlator.correlate()
    summary = correlation_results["summary"]
    print(f"    - Total AD Computers: {summary['total_ad_computers']}")
    print(f"    - Total Network Hosts: {summary['total_network_hosts']}")
    print(f"    - MATCHED:   {summary['matched_count']}")
    print(f"    - AMBIGUOUS: {summary['ambiguous_count']}")
    print(f"    - UNMATCHED: {summary['unmatched_count']}")
    print("    - Correlation Methods breakdown:")
    for m, c in summary["method_counts"].items():
        print(f"      * {m}: {c}")

    # Export Correlation Reports
    EntityCorrelator.export_reports(correlation_results, args.output)
    print(f"[+] Saved correlation CSV/JSON reports to: {args.output}")

    # 6. Graph Fusion
    print("[+] STEP 4: Executing Graph Fusion (AD + Network + RUNS_ON edges)...")
    fusion_engine = GraphFusionEngine(ad_data, net_data, correlation_results)
    fused_graph = fusion_engine.fuse()
    fused_json_path = os.path.join(args.output, "fused_attack_graph.json")
    fusion_engine.export_json(fused_json_path)
    print(f"    - Fused graph total nodes: {fused_graph.number_of_nodes()}")
    print(f"    - Fused graph total edges: {fused_graph.number_of_edges()}")
    print(f"    - Saved fused NetworkX graph to: {fused_json_path}")

    # 7. BloodHound / Neo4j Visualization Export
    print("[+] STEP 5: Exporting BloodHound-Compatible JSON...")
    bh_exporter = BloodHoundExporter(fused_graph)
    bh_json_path = os.path.join(args.output, "bloodhound_fused_graph.json")
    bh_exporter.export_bloodhound_json(bh_json_path)
    print(f"    - Saved BloodHound-style visualization graph to: {bh_json_path}")

    # 8. Attack Inference Engine
    print("[+] STEP 6: Running Identity-Aware Attack Inference...")
    inference_engine = AttackInferenceEngine(fused_graph)
    inference_results = inference_engine.infer_attack_paths()
    print(f"    - Inferred Attack Exposure Edges: {len(inference_results['inferred_edges'])}")

    # 9. Comprehensive Attack Path & Reachability Analysis
    print("[+] STEP 7: Computing ALL Possible Attack Paths (Sources -> Victims)...")
    reach_analyzer = ReachabilityAnalyzer(fused_graph)
    paths_data = reach_analyzer.analyze()
    
    # Export path reports
    ComprehensivePathAnalyzer.export_reports(paths_data, args.output)
    print(f"    - Saved all attack paths JSON to: {os.path.join(args.output, 'all_attack_paths.json')}")
    print(f"    - Saved all attack paths CSV to:  {os.path.join(args.output, 'all_attack_paths.csv')}")
    
    summary_stats = paths_data["summary"]
    print(f"\n    [PATH SUMMARY] Total Sources: {summary_stats['total_sources_evaluated']} | Total Victims: {summary_stats['total_victims_evaluated']} | Total Paths: {summary_stats['total_paths_found']}")
    print(f"    [CRITICAL] Paths reaching Domain Controller: {summary_stats['paths_to_dc_count']}\n")

    print("    ---------------------------------------------------------------------------------------------------")
    print("    PATH ID | SOURCE NODE (LABEL)         | TARGET VICTIM (LABEL)       | HOPS | SEQUENCE")
    print("    ---------------------------------------------------------------------------------------------------")
    for p in paths_data["paths"]:
        seq_str = " -> ".join(p["path_nodes"])
        print(f"    #{p['path_id']:<6} | {p['source_node']:<25} | {p['target_node']:<27} | {p['hop_length']:<4} | {seq_str}")
    print("    ---------------------------------------------------------------------------------------------------\n")

    # 10. Optional Experiments Comparison
    if args.experiment:
        print("[+] STEP 8: Running Experimental Comparison Across Correlation Methods...")
        exp_results = run_experiments(args.ad, args.network, config)
        print("    -------------------------------------------------------------------------")
        print("    Exp ID | Experiment Name                     | Matched | Ambiguous | Time (ms)")
        print("    -------------------------------------------------------------------------")
        for e in exp_results["experiments"]:
            print(f"    {e['experiment_id']:<6} | {e['experiment_name']:<35} | {e['matched']:<7} | {e['ambiguous']:<9} | {e['execution_time_ms']} ms")
        print("    -------------------------------------------------------------------------")

    print("==================================================================")
    print("[SUCCESS] Pipeline completed successfully!")
    print("==================================================================")

if __name__ == "__main__":
    main()
