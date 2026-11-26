# FOOTYLESS - DNS go-live checker
# Usage: powershell -ExecutionPolicy Bypass -File tools\check-dns.ps1
Write-Host "== footyless.com DNS status ==" -ForegroundColor Cyan

function Section($t) { Write-Host "`n--- $t ---" -ForegroundColor Yellow }

Section "Nameservers (expect fay/watson.ns.cloudflare.com)"
try { Resolve-DnsName footyless.com -Type NS -ErrorAction Stop | Where-Object NameHost | Select-Object -ExpandProperty NameHost } catch { "NS lookup failed: $($_.Exception.Message)" }

Section "Apex A records (expect github.io chain or Cloudflare edge IPs)"
try { (Resolve-DnsName footyless.com -Type A -ErrorAction Stop | Where-Object IPAddress | Select-Object -First 3 -ExpandProperty IPAddress) } catch { "A lookup: $($_.Exception.Message)" }
try { Resolve-DnsName footyless.com -Type CNAME -ErrorAction Stop | Where-Object NameHost | Select-Object -ExpandProperty NameHost } catch { "CNAME: not present (proxied apexes often hide it - fine)" }

Section "WWW (expect github.io chain)"
try { Resolve-DnsName www.footyless.com -Type CNAME -ErrorAction Stop | Where-Object NameHost | Select-Object -ExpandProperty NameHost } catch { try { (Resolve-DnsName www.footyless.com -Type A -ErrorAction Stop | Where-Object IPAddress | Select-Object -First 2 -ExpandProperty IPAddress) } catch { "www failed: $($_.Exception.Message)" } }

Section "HTTPS probe"
foreach ($u in "https://footyless.com/", "https://www.footyless.com/") {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20 -MaximumRedirection 5
    $title = ($r.Content | Select-String -Pattern "<title>[^<]+").Matches.Value
    "$u -> $($r.StatusCode) $title"
  } catch { "$u -> $($_.Exception.Message)" }
}
