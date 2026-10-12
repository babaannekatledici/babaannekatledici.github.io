// Confere o catálogo antes de publicar: se algo estiver errado, sai com erro e o deploy para.
// Uso: node scripts/validar-catalogo.mjs
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { precoKitBase, taxaPorKm } from "../site/js/regras.js";

const raiz = new URL("../site/", import.meta.url);
const cat = JSON.parse(readFileSync(new URL("dados/catalogo.json", raiz), "utf-8"));
const erros = [];
const erro = (msg) => erros.push(msg);

const precoOk = (valor, max) => typeof valor === "number" && Number.isFinite(valor) && valor > 0 && valor <= max;
function foto(caminho, onde) {
  if (!caminho) return erro(`${onde}: sem foto`);
  if (!existsSync(fileURLToPath(new URL(caminho, raiz)))) erro(`${onde}: foto não encontrada (${caminho})`);
}

if (!/^55\d{10,11}$/.test(cat.loja.whatsapp)) erro("loja.whatsapp: use só números, com 55 e DDD (ex.: 5581988186706)");

for (const [id, bolo] of Object.entries(cat.bolos)) {
  if (!precoOk(bolo.precoKg, 500)) erro(`bolos.${id}.precoKg absurdo ou vazio: ${bolo.precoKg}`);
  if (!(bolo.kgMin > 0 && bolo.kgMin <= bolo.kgMax)) erro(`bolos.${id}: kgMin/kgMax inválidos`);
  foto(bolo.foto, `bolos.${id}`);
}
const d = cat.bolos.decorado;
if (!(d.maxRecheios >= 1 && d.recheios.length >= d.maxRecheios)) erro("bolos.decorado: recheios/maxRecheios inválidos");
for (const a of d.adicionais) if (!precoOk(a.precoPorKg, 100)) erro(`adicional ${a.id}: preço absurdo ou vazio`);
if (d.formatos.some((f) => !(f.kgMin >= d.kgMin))) erro("formatos: kgMin menor que o do bolo");

const ids = new Set();
for (const p of [...cat.salgados, ...cat.doces]) {
  if (ids.has(p.id)) erro(`id repetido: ${p.id}`);
  ids.add(p.id);
  if (!precoOk(p.preco, 50)) erro(`${p.id}: preço absurdo ou vazio (${p.preco})`);
  if (!p.nome || !p.plural) erro(`${p.id}: falta nome ou plural`);
  foto(p.foto, p.id);
}

for (const k of cat.kits) {
  foto(k.foto, k.id);
  for (const id of [...Object.keys(k.salgados), ...Object.keys(k.doces)]) if (!ids.has(id)) erro(`${k.id}: produto desconhecido ${id}`);
  const salgados = Object.values(k.salgados).reduce((a, b) => a + b, 0);
  const doces = Object.values(k.doces).reduce((a, b) => a + b, 0);
  if (salgados > cat.regras.limitesPorDia.salgados || doces > cat.regras.limitesPorDia.doces) erro(`${k.id}: passa da capacidade de um dia`);
  if (Object.values(k.doces).some((q) => q % cat.regras.passoDocesKit !== 0)) erro(`${k.id}: doces fora do passo de ${cat.regras.passoDocesKit}`);
  if (salgados !== k.pessoas * cat.regras.salgadosPorPessoaKit) erro(`${k.id}: devia ter ${cat.regras.salgadosPorPessoaKit} salgados por pessoa`);
  if (doces !== k.pessoas * cat.regras.docesPorPessoaKit) erro(`${k.id}: devia ter ${cat.regras.docesPorPessoaKit} doces por pessoa`);
  if (!precoOk(precoKitBase(cat, k), 2000)) erro(`${k.id}: preço do kit absurdo`);
}

for (const b of cat.entrega.bairros) {
  if (b.km > cat.entrega.raioKm) erro(`bairro ${b.nome}: ${b.km} km passa do raio de ${cat.entrega.raioKm} km`);
  if (b.taxa !== taxaPorKm(cat, b.km)) erro(`bairro ${b.nome}: taxa ${b.taxa} não bate com a fórmula (${taxaPorKm(cat, b.km)})`);
}
for (const data of cat.regras.datasBloqueadas) if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) erro(`data bloqueada inválida: ${data} (use AAAA-MM-DD)`);
foto(cat.epoca.foto, "epoca");
const e = cat.empadao;
if (e) {
  // sem preço só se estiver marcado de propósito como "a confirmar"
  if (e.preco == null ? e.precoAConfirmar !== true : !precoOk(e.preco, 500)) erro(`empadao: preço absurdo ou vazio (${e.preco}); para deixar "a confirmar", use preco null e precoAConfirmar true`);
  if (!Array.isArray(e.sabores) || e.sabores.length === 0) erro("empadao: sem sabores");
  if (!(Number.isInteger(e.maxPorItem) && e.maxPorItem >= 1)) erro("empadao: maxPorItem inválido");
  foto(e.foto, "empadao");
}

// Fotos sem licença (ex.: tiradas do Pinterest) servem para ver o site no computador, nunca para publicar.
const publicar = process.argv.includes("--publicar");
for (const f of cat.fotos.semLicenca ?? []) {
  const msg = `foto sem licença: ${f.arquivo} (${f.origem}). ${f.motivo}`;
  if (publicar) erro(msg);
  else console.warn(`AVISO (bloqueia a publicação): ${msg}`);
}

if (erros.length) {
  console.error(`Catálogo com ${erros.length} problema(s):\n- ${erros.join("\n- ")}`);
  process.exit(1);
}
console.log(`Catálogo OK: ${cat.salgados.length} salgados, ${cat.doces.length} doces, ${cat.kits.length} kits, ${cat.entrega.bairros.length} bairros.`);
