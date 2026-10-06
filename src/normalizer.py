import ipaddress
import re

class EntityNormalizer:
    @staticmethod
    def normalize_hostname(hostname: str) -> dict:
        if not hostname:
            return {"original": hostname, "normalized": "", "short": ""}
        cleaned = hostname.strip().lower()
        if cleaned.endswith('$'):
            cleaned = cleaned[:-1]
        short_name = cleaned.split('.')[0]
        return {
            "original": hostname,
            "normalized": cleaned,
            "short": short_name
        }

    @staticmethod
    def normalize_ip(ip_str: str) -> dict:
        if not ip_str:
            return {"original": ip_str, "normalized": None, "is_valid": False}
        try:
            ip_obj = ipaddress.ip_address(ip_str.strip())
            return {
                "original": ip_str,
                "normalized": str(ip_obj),
                "is_valid": True,
                "version": ip_obj.version
            }
        except ValueError:
            return {
                "original": ip_str,
                "normalized": ip_str.strip(),
                "is_valid": False,
                "version": None
            }

    @staticmethod
    def normalize_mac(mac_str: str) -> dict:
        if not mac_str:
            return {"original": mac_str, "normalized": None, "is_valid": False}
        cleaned = re.sub(r'[^a-fA-F0-9]', '', mac_str.strip()).lower()
        if len(cleaned) == 12:
            formatted = ":".join(cleaned[i:i+2] for i in range(0, 12, 2))
            return {"original": mac_str, "normalized": formatted, "is_valid": True}
        return {"original": mac_str, "normalized": mac_str.strip(), "is_valid": False}

    @staticmethod
    def extract_os_family(os_string: str) -> str:
        if not os_string:
            return "unknown"
        s = os_string.lower()
        if "windows" in s or "win" in s:
            return "windows"
        elif "ubuntu" in s or "linux" in s or "debian" in s or "rhel" in s or "centos" in s:
            return "linux"
        return "other"
