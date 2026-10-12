// Testes da mensagem do WhatsApp: o texto exato que a Doce Maria vai receber.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { linkWhatsApp, montarMensagem } from "../site/js/mensagem.js";
import { OUTRO_BAIRRO } from "../site/js/regras.js";

const cat = JSON.parse(readFileSync(new URL("../site/dados/catalogo.json", import.meta.url), "utf-8"));

const kit15 = {
  tipo: "kit", kitId: "kit-15",
  bolo: { massa: "Chocolate", recheios: ["Ninho", "Prestígio"], formato: "redondo", adicionais: ["morango"], topo: true, decoracao: "tema Frozen, tons de azul" },
  salgados: { coxinha: 50, empada: 25 }, doces: { brigadeiro: 20, beijinho: 25, "bem-casado": 0 },
};
const dados = {
  nome: " Maria Silva ", data: "2026-10-17", hora: "15", modo: "entrega", bairro: "Boa Viagem", bairroOutro: "",
  endereco: "Rua X, 123", referencia: "perto da padaria", pagamento: "sinal", observacoes: "",
};

test("mensagem do exemplo combinado (kit com morango e topo, entrega em Boa Viagem)", () => {
  const texto = montarMensagem(cat, [kit15, { tipo: "unidade", produto: "bolinho-queijo", qtd: 25 }], dados);
  assert.equal(texto, [
    "Olá, Doce Maria! Quero fazer uma encomenda pelo site 🎂",
    "👤 Nome: Maria Silva",
    "📅 Para: sábado, 17/10, às 15h",
    "🚗 Entrega: Rua X, 123, Boa Viagem (taxa estimada R$ 10,00)",
    "   Referência: perto da padaria",
    "💳 Pagamento: sinal de 50% no Pix (R$ 210,00) e o restante (R$ 210,00) na entrega (sem contar o que está a confirmar)",
    "",
    "1x Kit Festa 15 (15 pessoas): R$ 345,00",
    "   Bolo decorado 1,5 kg",
    "   Redondo | Massa: chocolate | Recheios: ninho, prestígio",
    "   + Morango fresco: R$ 15,00",
    "   + Topo de bolo (papel impresso 3D): a partir de R$ 20,00, valor a confirmar (mando a foto do tema aqui)",
    "   Decoração: tema Frozen, tons de azul",
    "   Salgados: 50 coxinhas, 25 empadas",
    "   Doces: 20 brigadeiros, 25 beijinhos",
    "25x Bolinho de queijo: R$ 50,00",
    "",
    "Subtotal: R$ 410,00",
    "Entrega: R$ 10,00 (estimada)",
    "Total: R$ 420,00 + topo (a confirmar)",
    "",
    "Aguardo a confirmação da data e a chave Pix para o sinal.",
  ].join("\n"));
});

test("retirada pagando 100% e bolos avulsos", () => {
  const itens = [
    { tipo: "bolo", produto: "caseiro", kg: 1.5, sabor: "Macaxeira" },
    { tipo: "bolo", produto: "decorado", kg: 1, massa: "Branca (baunilha)", recheios: ["Doce de leite"], formato: "vulcao", adicionais: [], topo: false, decoracao: "" },
    { tipo: "unidade", produto: "brigadeiro", qtd: 25 },
  ];
  const texto = montarMensagem(cat, itens, { ...dados, modo: "retirada", pagamento: "integral", observacoes: "Sem açúcar de confeiteiro" });
  assert.match(texto, /🏠 Retirada: Rua Rio Ipojuca, 60, Ipsep, Recife - PE/);
  assert.match(texto, /💳 Pagamento: 100% no Pix \(R\$ 220,00\)\n/);
  assert.match(texto, /1x Bolo caseiro de macaxeira 1,5 kg: R\$ 97,50/);
  assert.match(texto, /1x Bolo decorado 1 kg \(10 a 12 fatias\): R\$ 85,00\n   Vulcão \| Massa: branca \(baunilha\) \| Recheio: doce de leite/);
  assert.match(texto, /Total: R\$ 220,00\n/);
  assert.match(texto, /📝 Observações: Sem açúcar de confeiteiro/);
  assert.match(texto, /chave Pix para o pagamento\.$/);
  assert.doesNotMatch(texto, /Salgados:/); // sem salgados, não pergunta frito ou congelado
  assert.doesNotMatch(texto, /Entrega:/);
});

test("outro bairro: taxa a confirmar, com o nome que o cliente escreveu", () => {
  const texto = montarMensagem(cat, [kit15], { ...dados, bairro: OUTRO_BAIRRO, bairroOutro: "Pina" });
  assert.match(texto, /🚗 Entrega: Rua X, 123, Pina \(taxa a confirmar\)/);
  assert.match(texto, /Entrega: a confirmar/);
  assert.match(texto, /Total: R\$ 360,00 \+ topo \+ entrega \(a confirmar\)/);
  assert.match(texto, /sinal de 50% no Pix \(R\$ 180,00\) e o restante \(R\$ 180,00\) na entrega/);
});

test("Uber/99: carro quando tem bolo, moto ou carro quando não tem", () => {
  const app = { ...dados, modo: "app" };
  assert.match(montarMensagem(cat, [kit15], app), /carro, porque tem bolo/);
  assert.match(montarMensagem(cat, [{ tipo: "unidade", produto: "coxinha", qtd: 25 }], app), /moto ou carro/);
});

test("o link do WhatsApp codifica acentos, emojis, &, # e quebras de linha", () => {
  const texto = "Olá! Bolo & doces #1 🎂\nLinha 2";
  const link = linkWhatsApp("5581988186706", texto);
  assert.ok(link.startsWith("https://wa.me/5581988186706?text="));
  const parametro = link.split("?text=")[1];
  assert.doesNotMatch(parametro, /[\s&#]/);
  assert.equal(decodeURIComponent(parametro), texto);
  assert.equal(new URL(link).searchParams.get("text"), texto);
});

test("empadão sem preço: linha com valor a confirmar e total avisando", () => {
  const texto = montarMensagem(cat, [{ tipo: "empadao", sabor: "Camarão com catupiry", qtd: 2 }], { ...dados, modo: "retirada" });
  assert.match(texto, /2x Empadão médio de camarão com catupiry: valor a confirmar/);
  assert.match(texto, /Total: R\$ 0,00 \+ empadão \(a confirmar\)/);
  assert.doesNotMatch(texto, /fritos|congelados/);
});
