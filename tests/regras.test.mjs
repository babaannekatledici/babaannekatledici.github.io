// Testes das regras de negócio (node --test). Datas de outubro de 2026:
// seg 12, qua 14, qui 15, sex 16, sáb 17, dom 18, seg 19.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as r from "../site/js/regras.js";

const catalogo = () => JSON.parse(readFileSync(new URL("../site/dados/catalogo.json", import.meta.url), "utf-8"));
const cat = catalogo();
const kit = (id) => cat.kits.find((k) => k.id === id);
/** Relógio de Recife: "2026-10-12T10:30" → Date com campos UTC = hora de Recife. */
const recife = (texto) => new Date(`${texto}:00Z`);

const boloDecorado = (extra = {}) => ({
  tipo: "bolo", produto: "decorado", kg: 2, massa: "Chocolate", recheios: ["Ninho"],
  formato: "redondo", adicionais: [], topo: false, decoracao: "", ...extra,
});
const itemKit = (id, extra = {}) => ({
  tipo: "kit", kitId: id,
  bolo: { massa: "Chocolate", recheios: ["Ninho", "Prestígio"], formato: "redondo", adicionais: [], topo: false, decoracao: "" },
  salgados: { ...kit(id).salgados }, doces: { ...kit(id).doces }, ...extra,
});
const unidade = (produto, qtd) => ({ tipo: "unidade", produto, qtd });
const empadao = (sabor, qtd) => ({ tipo: "empadao", sabor, qtd });

test("formata dinheiro e peso em português", () => {
  assert.equal(r.formatarMoeda(170), "R$ 170,00");
  assert.equal(r.formatarMoeda(1.5), "R$ 1,50");
  assert.equal(r.formatarKg(1.5), "1,5 kg");
  assert.equal(r.formatarKg(2), "2 kg");
});

test("kits custam a soma das partes: R$ 230, 345 e 460 (R$ 23 por pessoa)", () => {
  assert.deepEqual(cat.kits.map((k) => r.precoKitBase(cat, k)), [230, 345, 460]);
  for (const k of cat.kits) assert.equal(r.precoKitBase(cat, k) / k.pessoas, 23);
});

test("kits têm 100 g de bolo, 5 salgados e 3 doces por pessoa (mais salgado que doce)", () => {
  for (const k of cat.kits) {
    assert.equal(k.boloKg, k.pessoas / 10);
    assert.equal(Object.values(k.salgados).reduce((a, b) => a + b), k.pessoas * 5);
    assert.equal(Object.values(k.doces).reduce((a, b) => a + b), k.pessoas * 3);
  }
});

test("preço dos bolos: R$ 85/kg decorado, + R$ 10/kg por adicional; caseiro R$ 65; noiva R$ 100", () => {
  assert.equal(r.precoBolo(cat, boloDecorado()), 170);
  assert.equal(r.precoBolo(cat, boloDecorado({ adicionais: ["morango", "nutella"] })), 210);
  assert.equal(r.precoBolo(cat, boloDecorado({ kg: 1.5, adicionais: ["bombom"] })), 142.5);
  assert.equal(r.precoBolo(cat, { tipo: "bolo", produto: "caseiro", kg: 1.5, sabor: "Fubá" }), 97.5);
  assert.equal(r.precoBolo(cat, { tipo: "bolo", produto: "noiva", kg: 1 }), 100);
});

test("adicional no bolo do kit cobra pelo peso do bolo do kit", () => {
  const item = itemKit("kit-15");
  item.bolo.adicionais = ["morango"];
  assert.equal(r.precoItem(cat, item), 360);
});

test("salgados e doces avulsos: preço × quantidade sem erro de centavos", () => {
  assert.equal(r.precoItem(cat, unidade("bolinho-queijo", 25)), 50);
  assert.equal(r.precoItem(cat, unidade("brigadeiro", 75)), 112.5);
  assert.equal(r.precoItem(cat, unidade("coxinha", 33)), 66);
});

test("fatias aproximadas", () => {
  assert.equal(r.fatias(cat, "decorado", 1.5), "15 a 18 fatias");
  assert.equal(r.fatias(cat, "caseiro", 1), "8 fatias");
});

test("quantidades somam kits e avulsos", () => {
  const q = r.quantidades(cat, [itemKit("kit-10"), unidade("bolinho-queijo", 10), unidade("beijinho", 25), empadao("Charque", 2)]);
  assert.deepEqual(q, { salgados: 60, doces: 55, boloKg: 1, empadoes: 2, temBolo: true, temTopo: false });
});

test("mínimo de 25 salgados no total do pedido", () => {
  assert.deepEqual(r.errosDeQuantidade(cat, [unidade("coxinha", 20)]), ["Faltam 5 salgados para o mínimo de 25 no pedido."]);
  assert.deepEqual(r.errosDeQuantidade(cat, [unidade("coxinha", 15), unidade("empada", 10)]), []);
  // o kit já tem 50 salgados, então 10 bolinhos de queijo avulsos podem
  assert.deepEqual(r.errosDeQuantidade(cat, [itemKit("kit-10"), unidade("bolinho-queijo", 10)]), []);
  // empadão não conta como mini salgado: sozinho, não exige o mínimo de 25
  assert.deepEqual(r.errosDeQuantidade(cat, [empadao("Frango", 1)]), []);
  // só doces: não exige salgado
  assert.deepEqual(r.errosDeQuantidade(cat, [unidade("brigadeiro", 25)]), []);
});

test("capacidade de um dia: 100 salgados, 100 doces e 10 kg de bolo", () => {
  assert.deepEqual(r.errosDeQuantidade(cat, [itemKit("kit-20")]), []);
  assert.match(r.errosDeQuantidade(cat, [itemKit("kit-20"), unidade("coxinha", 5)])[0], /mais de 100 salgados/);
  assert.match(r.errosDeQuantidade(cat, [unidade("beijinho", 125)])[0], /mais de 100 doces/);
  assert.deepEqual(r.errosDeQuantidade(cat, [itemKit("kit-20"), boloDecorado({ kg: 8 })]), []);
  assert.match(r.errosDeQuantidade(cat, [itemKit("kit-20"), boloDecorado({ kg: 8.5 })])[0], /mais de 10 kg de bolo/);
});

test("doces só de 25 em 25", () => {
  assert.match(r.errosDeQuantidade(cat, [unidade("brigadeiro", 30)])[0], /de 25 em 25/);
});

test("bolo de andar só a partir de 1,5 kg", () => {
  assert.equal(r.formatoPermitido(cat, "andar", 1), false);
  assert.equal(r.formatoPermitido(cat, "andar", 1.5), true);
  assert.equal(r.formatoPermitido(cat, "vulcao", 1), true);
  assert.equal(r.formatoPermitido(cat, "inventado", 5), false);
});

test("a tabela de bairros bate com a fórmula da taxa (R$ 7 até 2 km + R$ 1,50 por km começado)", () => {
  assert.equal(r.taxaPorKm(cat, 1), 7);
  assert.equal(r.taxaPorKm(cat, 2), 7);
  assert.equal(r.taxaPorKm(cat, 2.1), 8.5);
  assert.equal(r.taxaPorKm(cat, 3.5), 10);
  assert.equal(r.taxaPorKm(cat, 4), 10);
  assert.equal(r.taxaPorKm(cat, 6), 13);
  for (const b of cat.entrega.bairros) {
    assert.equal(b.taxa, r.taxaPorKm(cat, b.km), b.nome);
    assert.ok(b.km <= cat.entrega.raioKm, `${b.nome} fora do raio`);
  }
  assert.equal(r.taxaEntrega(cat, "Boa Viagem"), 10);
  assert.equal(r.taxaEntrega(cat, r.OUTRO_BAIRRO), null);
});

test("hora de Recife não depende do fuso do aparelho (UTC-3 o ano todo)", () => {
  const t = r.agoraEmRecife(new Date("2026-10-12T13:00:00Z"));
  assert.equal(t.getUTCHours(), 10);
  assert.equal(r.dataIso(t), "2026-10-12");
});

test("primeiro horário: 48 h depois, arredondado para a hora cheia", () => {
  assert.equal(r.primeiroHorario(cat, recife("2026-10-12T10:30"), false).toISOString(), "2026-10-14T11:00:00.000Z");
  assert.equal(r.primeiroHorario(cat, recife("2026-10-12T10:00"), false).toISOString(), "2026-10-14T10:00:00.000Z");
});

test("primeiro horário pula a noite e o domingo", () => {
  // quinta 21h + 48 h = sábado 21h (depois das 20h) → domingo fechado → segunda 8h
  assert.equal(r.primeiroHorario(cat, recife("2026-10-15T21:00"), false).toISOString(), "2026-10-19T08:00:00.000Z");
  // sexta 15h + 48 h = domingo → segunda 8h
  assert.equal(r.primeiroHorario(cat, recife("2026-10-16T15:00"), false).toISOString(), "2026-10-19T08:00:00.000Z");
  // quinta 5h + 48 h = sábado 5h → sábado 8h
  assert.equal(r.primeiroHorario(cat, recife("2026-10-15T05:00"), false).toISOString(), "2026-10-17T08:00:00.000Z");
});

test("com topo, 5 dias de antecedência", () => {
  assert.equal(r.primeiroHorario(cat, recife("2026-10-12T10:00"), true).toISOString(), "2026-10-17T10:00:00.000Z");
});

test("datas bloqueadas (agenda cheia) são puladas", () => {
  const c = catalogo();
  c.regras.datasBloqueadas = ["2026-10-14"];
  assert.equal(r.primeiroHorario(c, recife("2026-10-12T10:00"), false).toISOString(), "2026-10-15T08:00:00.000Z");
  assert.match(r.erroDeHorario(c, r.montarHorario("2026-10-14", 15), recife("2026-10-12T10:00"), false), /agenda cheia/);
});

test("erros de horário com mensagem clara", () => {
  const agora = recife("2026-10-12T10:00");
  assert.match(r.erroDeHorario(cat, r.montarHorario("2026-10-18", 10), agora, false), /domingos/);
  assert.match(r.erroDeHorario(cat, r.montarHorario("2026-10-15", 7), agora, false), /entre 8h e 20h/);
  assert.match(r.erroDeHorario(cat, r.montarHorario("2026-10-15", 21), agora, false), /entre 8h e 20h/);
  assert.match(r.erroDeHorario(cat, r.montarHorario("2026-10-14", 9), agora, false), /48 horas/);
  assert.equal(r.erroDeHorario(cat, r.montarHorario("2026-10-14", 10), agora, false), null);
  assert.equal(r.erroDeHorario(cat, r.montarHorario("2026-10-14", 20), agora, false), null);
  assert.match(r.erroDeHorario(cat, r.montarHorario("2026-10-16", 10), agora, true), /topo de bolo.*5 dias/);
  assert.equal(r.erroDeHorario(cat, r.montarHorario("2026-10-17", 10), agora, true), null);
});

test("horas disponíveis num dia", () => {
  const agora = recife("2026-10-12T10:00");
  assert.deepEqual(r.horasDisponiveis(cat, "2026-10-14", agora, false), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.deepEqual(r.horasDisponiveis(cat, "2026-10-13", agora, false), []);
  assert.deepEqual(r.horasDisponiveis(cat, "2026-10-18", agora, false), []);
  assert.equal(r.horasDisponiveis(cat, "2026-10-15", agora, false).length, 13);
});

test("data por extenso", () => {
  assert.equal(r.formatarHorario(r.montarHorario("2026-10-17", 15)), "sábado, 17/10, às 15h");
});

test("pagamento: sinal de 50% ou 100%; com Uber/99 só 100%", () => {
  assert.deepEqual(r.pagamentosPermitidos("app"), ["integral"]);
  assert.deepEqual(r.pagamentosPermitidos("entrega"), ["sinal", "integral"]);
  assert.deepEqual(r.pagamentosPermitidos("retirada"), ["sinal", "integral"]);
  assert.deepEqual(r.valoresPagamento(cat, 420, "sinal"), { agora: 210, depois: 210 });
  assert.deepEqual(r.valoresPagamento(cat, 455.5, "sinal"), { agora: 227.75, depois: 227.75 });
  assert.deepEqual(r.valoresPagamento(cat, 100.01, "sinal"), { agora: 50.01, depois: 50 });
  assert.deepEqual(r.valoresPagamento(cat, 420, "integral"), { agora: 420, depois: 0 });
});

test("totais com taxa estimada, taxa a confirmar e topo a confirmar", () => {
  const itens = [itemKit("kit-15"), unidade("bolinho-queijo", 25)];
  assert.deepEqual(r.totais(cat, itens, { modo: "entrega", bairro: "Boa Viagem" }), { subtotal: 395, taxa: 10, total: 405, aConfirmar: [] });
  assert.deepEqual(r.totais(cat, itens, { modo: "retirada" }), { subtotal: 395, taxa: 0, total: 395, aConfirmar: [] });
  assert.deepEqual(r.totais(cat, itens, { modo: "entrega", bairro: r.OUTRO_BAIRRO }).aConfirmar, ["entrega"]);
  const comTopo = [boloDecorado({ topo: true })];
  assert.deepEqual(r.totais(cat, comTopo, { modo: "app" }), { subtotal: 170, taxa: 0, total: 170, aConfirmar: ["topo"] });
});

const pedidoValido = () => ({
  nome: "Maria Silva", data: "2026-10-14", hora: "15", modo: "entrega", bairro: "Boa Viagem",
  bairroOutro: "", endereco: "Rua X, 123", referencia: "", pagamento: "sinal", observacoes: "",
});

test("pedido completo e válido não tem erros", () => {
  assert.deepEqual(r.validarPedido(cat, [itemKit("kit-10")], pedidoValido(), recife("2026-10-12T10:00")), {});
});

test("pedido inválido aponta cada campo", () => {
  const agora = recife("2026-10-12T10:00");
  assert.deepEqual(Object.keys(r.validarPedido(cat, [], { modo: "" }, agora)).sort(),
    ["horario", "itens", "modo", "nome", "pagamento"]);
  const semBairro = { ...pedidoValido(), bairro: "", endereco: " " };
  assert.deepEqual(Object.keys(r.validarPedido(cat, [itemKit("kit-10")], semBairro, agora)).sort(), ["bairro", "endereco"]);
  const outroSemNome = { ...pedidoValido(), bairro: r.OUTRO_BAIRRO, bairroOutro: " " };
  assert.equal(r.validarPedido(cat, [itemKit("kit-10")], outroSemNome, agora).bairro, "Escreva o nome do bairro.");
  const sinalNoApp = { ...pedidoValido(), modo: "app", pagamento: "sinal" };
  assert.equal(r.validarPedido(cat, [itemKit("kit-10")], sinalNoApp, agora).pagamento, "Quem chama Uber ou 99 paga 100% no Pix.");
  const cedo = { ...pedidoValido(), data: "2026-10-13" };
  assert.match(r.validarPedido(cat, [itemKit("kit-10")], cedo, agora).horario, /48 horas/);
  const topoCedo = { ...pedidoValido(), data: "2026-10-15" };
  assert.match(r.validarPedido(cat, [boloDecorado({ topo: true })], topoCedo, agora).horario, /5 dias/);
});

test("salgados sempre fritos: o pedido não pergunta mais frito ou congelado", () => {
  const erros = r.validarPedido(cat, [itemKit("kit-10")], pedidoValido(), recife("2026-10-12T10:00"));
  assert.deepEqual(erros, {});
  assert.equal("preparo" in erros, false);
});

test("empadão médio: sabores do catálogo, preço a confirmar até a Doce Maria definir", () => {
  assert.deepEqual(cat.empadao.sabores, ["Frango", "Frango com catupiry", "Camarão com catupiry", "Charque", "Costela com catupiry"]);
  assert.equal(r.precoItem(cat, empadao("Charque", 2)), null);
  const t = r.totais(cat, [itemKit("kit-10"), empadao("Charque", 2)], { modo: "retirada" });
  assert.deepEqual(t, { subtotal: 230, taxa: 0, total: 230, aConfirmar: ["empadão"] });
  // quando ela passar o preço, basta preencher no catálogo
  const c = catalogo();
  c.empadao.preco = 45;
  assert.equal(r.precoItem(c, empadao("Charque", 2)), 90);
  assert.deepEqual(r.totais(c, [empadao("Charque", 2)], { modo: "retirada" }).aConfirmar, []);
});

test("empadão: de 1 a 10 por sabor", () => {
  assert.deepEqual(r.errosDeQuantidade(cat, [empadao("Frango", 10)]), []);
  assert.match(r.errosDeQuantidade(cat, [empadao("Frango", 11)])[0], /de 1 a 10/);
  assert.match(r.errosDeQuantidade(cat, [empadao("Frango", 0)])[0], /de 1 a 10/);
});

test("entrega até 10 km de carro: 54 bairros, taxa de R$ 7 a R$ 19", () => {
  assert.equal(cat.entrega.raioKm, 10);
  const taxas = cat.entrega.bairros.map((b) => b.taxa);
  assert.equal(Math.min(...taxas), 7);
  assert.equal(Math.max(...taxas), 19);
  assert.equal(r.taxaEntrega(cat, "Graças"), 19);
});
