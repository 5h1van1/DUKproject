import socket
try:
    import dns.resolver
    HAS_DNSPYTHON = True
except ImportError:
    HAS_DNSPYTHON = False

class DNSResolver:
    def __init__(self, fallback_mapping: dict = None, use_system_dns: bool = False):
        self.fallback_mapping = fallback_mapping or {}
        self.use_system_dns = use_system_dns

    def resolve(self, hostname_or_fqdn: str) -> dict:
        if not hostname_or_fqdn:
            return {"resolved_ips": [], "method": "none", "success": False}

        cleaned_host = hostname_or_fqdn.strip()

        # 1. Check fallback mapping first
        if cleaned_host in self.fallback_mapping:
            return {
                "resolved_ips": [self.fallback_mapping[cleaned_host]],
                "method": "fallback_config",
                "success": True
            }

        # Case-insensitive fallback lookup
        for k, v in self.fallback_mapping.items():
            if k.lower() == cleaned_host.lower():
                return {
                    "resolved_ips": [v],
                    "method": "fallback_config",
                    "success": True
                }

        # 2. Attempt real DNS resolution if enabled
        if self.use_system_dns:
            if HAS_DNSPYTHON:
                try:
                    answers = dns.resolver.resolve(cleaned_host, 'A')
                    ips = [rdata.to_text() for rdata in answers]
                    if ips:
                        return {"resolved_ips": ips, "method": "dnspython", "success": True}
                except Exception:
                    pass

            try:
                ip = socket.gethostbyname(cleaned_host)
                return {"resolved_ips": [ip], "method": "socket", "success": True}
            except socket.gaierror:
                pass

        return {"resolved_ips": [], "method": "failed", "success": False}
