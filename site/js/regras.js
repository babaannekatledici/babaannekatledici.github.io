// Regras de negócio da Doce Maria: preço, limites, datas e validação do pedido.
// Funções puras (sem tela, sem rede): recebem o catálogo e devolvem valores.
// Assim dá para testar cada regra com `node --test` e a tela só chama estas funções.

// ---------- Formatação ----------

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 170 → "R$ 170,00" (com espaço normal, para ficar igual no WhatsApp e nos testes). */
export function formatarMoeda(valor) {
  return moeda.format(valor).replace(/\s/g, " ");
}

/** 1.5 → "1,5 kg"; 2 → "2 kg". */
export function formatarKg(kg) {
  return `${String(kg).replace(".", ",")} kg`;
}

/** Soma em centavos para não acumular erro de ponto flutuante (0,1 + 0,2). */
function somar(valores) {
  return valores.reduce((total, v) => total + Math.round(v * 100), 0) / 100;
}

// ---------- Preços ----------

/** Preço de um bolo avulso (decorado, caseiro ou de noiva), sem o topo (que é a confirmar). */
export function precoBolo(cat, item) {
  const bolo = cat.bolos[item.produto];
  const adicionais = item.produto === "decorado" ? precoAdicionais(cat, item.adicionais, item.kg) : 0;
  return somar([bolo.precoKg * item.kg, adicionais]);
}

/** Cada adicional custa um valor por kg do bolo. */
export function precoAdicionais(cat, ids = [], kg) {
  const lista = cat.bolos.decorado.adicionais;
  return somar(ids.map((id) => lista.find((a) => a.id === id).precoPorKg * kg));
}

/** Preço do kit = soma dos preços de cada parte (bolo decorado + salgados + doces). */
export function precoKitBase(cat, kit) {
  const salgados = Object.entries(kit.salgados).map(([id, qtd]) => produto(cat, id).preco * qtd);
  const doces = Object.entries(kit.doces).map(([id, qtd]) => produto(cat, id).preco * qtd);
  return somar([cat.bolos.decorado.precoKg * kit.boloKg, ...salgados, ...doces]);
}

/** Preço de um item, ou null quando ainda não tem preço (ex.: empadão, "valor a confirmar"). */
export function precoItem(cat, item) {
  if (item.tipo === "bolo") return precoBolo(cat, item);
  if (item.tipo === "empadao") return cat.empadao.preco == null ? null : somar([cat.empadao.preco * item.qtd]);
  if (item.tipo === "kit") {
    const kit = cat.kits.find((k) => k.id === item.kitId);
    return somar([precoKitBase(cat, kit), precoAdicionais(cat, item.bolo.adicionais, kit.boloKg)]);
  }
  return somar([produto(cat, item.produto).preco * item.qtd]);
}

/** Procura um salgado ou doce pelo id. */
export function produto(cat, id) {
  const achado = [...cat.salgados, ...cat.doces].find((p) => p.id === id);
  if (!achado) throw new Error(`Produto desconhecido: ${id}`);
  return achado;
}

export function categoriaDe(cat, id) {
  return cat.salgados.some((p) => p.id === id) ? "salgados" : "doces";
}

/** Fatias aproximadas: 1,5 kg de decorado → "15 a 18 fatias". */
export function fatias(cat, produtoBolo, kg) {
  const [min, max] = cat.bolos[produtoBolo].fatiasPorKg.map((f) => Math.round(f * kg));
  return min === max ? `${min} fatias` : `${min} a ${max} fatias`;
}

// ---------- Quantidades e limites ----------

/** Soma o que o pedido ocupa da capacidade do dia. */
export function quantidades(cat, itens) {
  const q = { salgados: 0, doces: 0, boloKg: 0, empadoes: 0, temBolo: false, temTopo: false };
  for (const item of itens) {
    if (item.tipo === "bolo") {
      q.boloKg += item.kg;
      q.temBolo = true;
      q.temTopo ||= Boolean(item.topo);
    } else if (item.tipo === "kit") {
      const kit = cat.kits.find((k) => k.id === item.kitId);
      q.boloKg += kit.boloKg;
      q.temBolo = true;
      q.temTopo ||= Boolean(item.bolo.topo);
      q.salgados += soma(item.salgados);
      q.doces += soma(item.doces);
    } else if (item.tipo === "empadao") {
      q.empadoes += item.qtd;
    } else {
      q[categoriaDe(cat, item.produto)] += item.qtd;
    }
  }
  return q;
}

function soma(objeto) {
  return Object.values(objeto).reduce((a, b) => a + b, 0);
}

/** Erros de quantidade do pedido inteiro (mínimo e capacidade de um dia). */
export function errosDeQuantidade(cat, itens) {
  const r = cat.regras;
  const q = quantidades(cat, itens);
  const erros = [];
  if (q.salgados > 0 && q.salgados < r.minimoSalgados) {
    erros.push(`Faltam ${r.minimoSalgados - q.salgados} salgados para o mínimo de ${r.minimoSalgados} no pedido.`);
  }
  if (q.salgados > r.limitesPorDia.salgados) {
    erros.push(`Para mais de ${r.limitesPorDia.salgados} salgados num dia, fale direto com a Doce Maria.`);
  }
  if (q.doces > r.limitesPorDia.doces) {
    erros.push(`Para mais de ${r.limitesPorDia.doces} doces num dia, fale direto com a Doce Maria.`);
  }
  if (q.boloKg > r.limitesPorDia.boloKg) {
    erros.push(`Para mais de ${formatarKg(r.limitesPorDia.boloKg)} de bolo num dia, fale direto com a Doce Maria.`);
  }
  for (const item of itens) {
    if (item.tipo === "unidade" && categoriaDe(cat, item.produto) === "doces" && item.qtd % r.passoDoces !== 0) {
      erros.push(`Os doces são vendidos de ${r.passoDoces} em ${r.passoDoces}.`);
    }
    if (item.tipo === "empadao" && !(Number.isInteger(item.qtd) && item.qtd >= 1 && item.qtd <= cat.empadao.maxPorItem)) {
      erros.push(`Empadão: de 1 a ${cat.empadao.maxPorItem} por sabor.`);
    }
  }
  return erros;
}

/** Bolo de andar só a partir do peso mínimo do formato (1,5 kg). */
export function formatoPermitido(cat, formatoId, kg) {
  const formato = cat.bolos.decorado.formatos.find((f) => f.id === formatoId);
  return Boolean(formato) && kg >= formato.kgMin;
}

// ---------- Datas ----------
// Recife não tem horário de verão: UTC-3 o ano todo. Representamos o "relógio de Recife"
// como um Date cujos campos UTC são a hora de Recife. Assim o resultado não depende do
// fuso do celular de quem abre o site (lição do Projeto 3).

const UMA_HORA = 3600 * 1000;
const UM_DIA = 24 * UMA_HORA;
const FUSO_RECIFE = -3 * UMA_HORA;
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export function agoraEmRecife(agora = new Date()) {
  return new Date(agora.getTime() + FUSO_RECIFE);
}

export function antecedenciaMs(cat, temTopo) {
  return temTopo ? cat.regras.antecedenciaTopoDias * UM_DIA : cat.regras.antecedenciaHoras * UMA_HORA;
}

/** "2026-10-18" a partir do relógio de Recife. */
export function dataIso(t) {
  return t.toISOString().slice(0, 10);
}

export function montarHorario(dataTexto, hora) {
  const [a, m, d] = dataTexto.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, hora));
}

export function diaFechado(cat, t) {
  return cat.regras.diasFechados.includes(t.getUTCDay()) || cat.regras.datasBloqueadas.includes(dataIso(t));
}

function proximoDiaAbrindo(cat, t) {
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 1, cat.regras.horaAbre));
}

/** Primeiro horário de entrega/retirada possível: agora + antecedência, em hora cheia, em dia aberto. */
export function primeiroHorario(cat, agoraRecife, temTopo) {
  const { horaAbre, horaFecha } = cat.regras;
  let t = new Date(agoraRecife.getTime() + antecedenciaMs(cat, temTopo));
  if (t.getTime() % UMA_HORA !== 0) t = new Date((Math.floor(t.getTime() / UMA_HORA) + 1) * UMA_HORA);
  for (let i = 0; i < 400; i++) {
    if (diaFechado(cat, t) || t.getUTCHours() > horaFecha) t = proximoDiaAbrindo(cat, t);
    else if (t.getUTCHours() < horaAbre) t = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), horaAbre));
    else return t;
  }
  throw new Error("Nenhuma data livre no próximo ano: confira datasBloqueadas.");
}

/** Mensagem de erro do horário escolhido, ou null se estiver tudo certo. */
export function erroDeHorario(cat, horario, agoraRecife, temTopo) {
  const { horaAbre, horaFecha, antecedenciaHoras, antecedenciaTopoDias } = cat.regras;
  if (cat.regras.diasFechados.includes(horario.getUTCDay())) {
    return `Aos ${DIAS[horario.getUTCDay()]}s não há entrega nem retirada. Escolha outro dia.`;
  }
  if (cat.regras.datasBloqueadas.includes(dataIso(horario))) {
    return "Essa data já está com a agenda cheia. Escolha outro dia.";
  }
  const h = horario.getUTCHours();
  if (h < horaAbre || h > horaFecha || horario.getUTCMinutes() !== 0) {
    return `Escolha um horário entre ${horaAbre}h e ${horaFecha}h.`;
  }
  if (horario.getTime() < agoraRecife.getTime() + antecedenciaMs(cat, temTopo)) {
    return temTopo
      ? `Com topo de bolo, a encomenda precisa de ${antecedenciaTopoDias} dias de antecedência.`
      : `As encomendas precisam de ${antecedenciaHoras} horas de antecedência.`;
  }
  return null;
}

/** Horas que podem ser escolhidas numa data (vazio se o dia estiver fechado ou cedo demais). */
export function horasDisponiveis(cat, dataTexto, agoraRecife, temTopo) {
  const horas = [];
  for (let h = cat.regras.horaAbre; h <= cat.regras.horaFecha; h++) {
    if (!erroDeHorario(cat, montarHorario(dataTexto, h), agoraRecife, temTopo)) horas.push(h);
  }
  return horas;
}

/** "sábado, 18/10, às 15h". */
export function formatarHorario(t) {
  const dia = String(t.getUTCDate()).padStart(2, "0");
  const mes = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${DIAS[t.getUTCDay()]}, ${dia}/${mes}, às ${t.getUTCHours()}h`;
}

// ---------- Entrega e pagamento ----------

/** Valor do campo bairro quando o cliente escolhe "Outro bairro" e digita o nome. */
export const OUTRO_BAIRRO = "outro";

export function nomeDoBairro(dados) {
  return dados.bairro === OUTRO_BAIRRO ? (dados.bairroOutro ?? "").trim() : dados.bairro;
}

/** Taxa estimada do bairro, ou null quando é "outro bairro" (a confirmar). */
export function taxaEntrega(cat, bairro) {
  const achado = cat.entrega.bairros.find((b) => b.nome === bairro);
  return achado ? achado.taxa : null;
}

/** A fórmula da Doce Maria: R$ 7 até 2 km e + R$ 1,50 por km começado. Usada para conferir a tabela. */
export function taxaPorKm(cat, km) {
  const { taxaBase, kmBase, porKm } = cat.entrega;
  return km <= kmBase ? taxaBase : somar([taxaBase, porKm * Math.ceil(km - kmBase - 1e-9)]);
}

/** Quem chama Uber/99 paga no Pix (o motorista não recebe pela Doce Maria). */
export function pagamentosPermitidos(modo) {
  return modo === "app" ? ["pix"] : ["pix", "dinheiro"];
}

// ---------- Pedido ----------

/** Subtotal, taxa e total. `aConfirmar` lista o que ainda não tem preço (topo, entrega fora da lista). */
export function totais(cat, itens, dados) {
  const precos = itens.map((i) => precoItem(cat, i));
  const subtotal = somar(precos.filter((p) => p !== null));
  const aConfirmar = [];
  if (quantidades(cat, itens).temTopo) aConfirmar.push("topo");
  if (itens.some((i, k) => i.tipo === "empadao" && precos[k] === null)) aConfirmar.push("empadão");
  let taxa = 0;
  if (dados.modo === "entrega") {
    taxa = dados.bairro ? taxaEntrega(cat, dados.bairro) : null;
    if (taxa === null) aConfirmar.push("entrega");
  }
  return { subtotal, taxa, total: somar([subtotal, taxa ?? 0]), aConfirmar };
}

/**
 * Valida o pedido inteiro antes de abrir o WhatsApp.
 * Devolve um objeto { campo: mensagem }; vazio quando está tudo certo.
 */
export function validarPedido(cat, itens, dados, agoraRecife) {
  const erros = {};
  if (itens.length === 0) erros.itens = "Seu pedido está vazio.";
  else {
    const qtd = errosDeQuantidade(cat, itens);
    if (qtd.length) erros.itens = qtd.join(" ");
  }
  if (!dados.nome || dados.nome.trim().length < 2) erros.nome = "Diga seu nome.";

  const q = quantidades(cat, itens);
  if (!dados.data || dados.hora === "" || dados.hora == null) erros.horario = "Escolha a data e o horário.";
  else {
    const erro = erroDeHorario(cat, montarHorario(dados.data, Number(dados.hora)), agoraRecife, q.temTopo);
    if (erro) erros.horario = erro;
  }

  if (!dados.modo) erros.modo = "Escolha como vai receber o pedido.";
  if (dados.modo === "entrega") {
    if (!dados.bairro) erros.bairro = "Escolha o bairro.";
    else if (dados.bairro === OUTRO_BAIRRO && nomeDoBairro(dados).length < 2) erros.bairro = "Escreva o nome do bairro.";
    if (!dados.endereco || dados.endereco.trim().length < 5) erros.endereco = "Informe a rua e o número.";
  }

  if (!dados.pagamento) erros.pagamento = "Escolha a forma de pagamento.";
  else if (!pagamentosPermitidos(dados.modo).includes(dados.pagamento)) {
    erros.pagamento = "Quem chama Uber ou 99 paga no Pix.";
  }

  return erros;
}
