import whois
import socket
import ssl
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from fuzzywuzzy import fuzz

# Lista de marcas conhecidas para comparação
KNOWN_BRANDS = ["paypal.com", "google.com", "amazon.com", "facebook.com"]

def check_whois(domain):
    try:
        w = whois.whois(domain)
        return str(w.creation_date)
    except Exception as e:
        return f"WHOIS lookup failed: {e}"

def check_dns_dynamic(domain):
    # Serviços de DNS dinâmico conhecidos
    dynamic_services = ['no-ip', 'dyndns', 'duckdns', 'freedns']
    return any(service in domain for service in dynamic_services)

def check_ssl(domain):
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(3.0)
            s.connect((domain, 443))
            cert = s.getpeercert()
            return {
                'issuer': cert.get('issuer'),
                'valid_from': cert.get('notBefore'),
                'valid_to': cert.get('notAfter')
            }
    except Exception as e:
        return f"SSL check failed: {e}"

def check_redirects(url):
    try:
        response = requests.get(url, timeout=5, allow_redirects=True)
        # Lista das URLs intermediárias de redirecionamento
        return [resp.url for resp in response.history] if response.history else []
    except Exception as e:
        return f"Redirect check failed: {e}"

def check_similarity(domain):
    results = {}
    for brand in KNOWN_BRANDS:
        ratio = fuzz.ratio(domain, brand)
        results[brand] = ratio
    return results

def check_html_content(url):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        forms = soup.find_all('form')
        sensitive = any('password' in str(f).lower() or 'login' in str(f).lower() for f in forms)
        return {
            'forms_found': len(forms),
            'sensitive_info': sensitive
        }
    except Exception as e:
        return f"HTML check failed: {e}"

def full_analysis(url):
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path

    results = {
        'openphish': check_openphish(url),
        'whois': check_whois(domain),
        'dns_dynamic': check_dns_dynamic(domain),
        'ssl': check_ssl(domain),
        'redirects': check_redirects(url),
        'similarity': check_similarity(domain),
        'html_content': check_html_content(url)
    }
    return results

def check_openphish(url):
    try:
        response = requests.get("https://openphish.com/feed.txt", timeout=10)
        if response.status_code == 200:
            phishing_urls = response.text.splitlines()
            return url in phishing_urls
        else:
            return f"OpenPhish error: {response.status_code}"
    except Exception as e:
        return f"OpenPhish check failed: {e}"