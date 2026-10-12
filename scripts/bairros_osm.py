"""Calcula a taxa de entrega estimada por bairro a partir da casa da Doce Maria.

Fontes: Nominatim (endereço → coordenada), Overpass (bairros oficiais do OpenStreetMap,
admin_level 10, com o centro de cada um) e OSRM (distância de carro até o centro do bairro).
Os três são serviços públicos do OpenStreetMap: rodar só quando mudar a regra, não no site.

Entram os bairros cujo centro fica a até `raio_km` de caminho de carro (padrão: 6).

Uso: python -I scripts/bairros_osm.py [raio_km]
"""
import io
import json
import math
import sys
import urllib.error
import urllib.parse
import urllib.request

UA = {"User-Agent": "docemaria-site-planejamento/0.1 (github.com/DiegoSantiago1)"}
OVERPASS = ["https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"]
LAT, LON = -8.1095910, -34.9173571  # Rua Rio Ipojuca, 60, Ipsep (Nominatim, 12/10/2026)


def obter(url: str, dados: bytes | None = None) -> dict:
    req = urllib.request.Request(url, data=dados, headers=UA)
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode())


def em_linha_reta(lat: float, lon: float) -> float:
    p1, p2 = math.radians(LAT), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lon - LON)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def taxa(km: float) -> float:
    """R$ 7 até 2 km; depois, + R$ 1,50 por km começado (regra da Doce Maria)."""
    return 7.0 if km <= 2 else 7.0 + 1.5 * math.ceil(km - 2)


def main() -> None:
    if isinstance(sys.stdout, io.TextIOWrapper):  # console do Windows não é UTF-8
        sys.stdout.reconfigure(encoding="utf-8")
    raio = float(sys.argv[1]) if len(sys.argv) > 1 else 6.0
    consulta = f"""[out:json][timeout:120];
relation["boundary"="administrative"]["admin_level"="10"](around:{raio * 1000 + 3000},{LAT},{LON});
out center tags;"""
    d = None
    for servidor in OVERPASS:  # servidores públicos às vezes dão 504: tenta o próximo
        try:
            d = obter(servidor, urllib.parse.urlencode({"data": consulta}).encode())
            break
        except urllib.error.URLError as erro:
            print(f"{servidor}: {erro}", file=sys.stderr)
    if d is None:
        sys.exit("Nenhum servidor Overpass respondeu; tente mais tarde.")
    bairros = []
    for el in d["elements"]:
        nome, c = el.get("tags", {}).get("name"), el.get("center")
        if nome and c and em_linha_reta(c["lat"], c["lon"]) <= raio:
            bairros.append({"nome": nome, "lat": c["lat"], "lon": c["lon"],
                            "reta_km": round(em_linha_reta(c["lat"], c["lon"]), 1)})
    pontos = ";".join([f"{LON},{LAT}"] + [f'{b["lon"]},{b["lat"]}' for b in bairros])
    rota = obter(f"https://router.project-osrm.org/table/v1/driving/{pontos}"
                 "?sources=0&annotations=distance")["distances"][0][1:]
    for b, m in zip(bairros, rota):
        b["carro_km"] = round(m / 1000, 1)
        b["taxa"] = taxa(m / 1000)
    # O raio dela é de caminho de carro (12/10/2026). A reta acima só pré-filtra:
    # o caminho de carro nunca é menor que a linha reta.
    bairros = [b for b, m in zip(bairros, rota) if m / 1000 <= raio]
    print("| Bairro | Linha reta | De carro | Taxa estimada |\n|---|---|---|---|")
    for b in sorted(bairros, key=lambda b: (b["taxa"], b["nome"])):
        print(f'| {b["nome"]} | {b["reta_km"]:.1f} km | {b["carro_km"]:.1f} km | '
              f'R$ {b["taxa"]:.2f}'.replace(".", ",") + " |")


if __name__ == "__main__":
    main()
