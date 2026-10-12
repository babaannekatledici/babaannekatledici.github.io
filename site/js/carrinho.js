// Carrinho: lista de itens, guardada só no aparelho do cliente (localStorage).
// Guarda apenas os itens, nunca nome, endereço ou telefone (decisão D2).

const CHAVE = "docemaria.carrinho.v1";

// crypto.randomUUID só existe em HTTPS/localhost; testando pelo IP da rede no celular, não.
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function lerSalvo(storage) {
  try {
    const itens = JSON.parse(storage?.getItem(CHAVE) ?? "[]");
    return Array.isArray(itens) ? itens : [];
  } catch {
    return []; // modo anônimo, armazenamento bloqueado ou dado corrompido: começa vazio
  }
}

/**
 * @param {Storage | null} storage  localStorage no navegador; null nos testes.
 * @param {(item: object) => boolean} itemValido  descarta itens que não existem mais no catálogo.
 */
export function criarCarrinho(storage, itemValido = () => true) {
  let itens = lerSalvo(storage).filter((item) => {
    try {
      return itemValido(item);
    } catch {
      return false;
    }
  });
  const ouvintes = new Set();

  function mudou() {
    try {
      storage?.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      // sem armazenamento o carrinho continua funcionando, só não sobrevive a recarregar a página
    }
    for (const ouvinte of ouvintes) ouvinte(itens);
  }

  return {
    itens: () => itens,
    adicionar(item) {
      itens = [...itens, { ...item, id: novoId() }];
      mudou();
    },
    substituir(id, item) {
      itens = itens.map((i) => (i.id === id ? { ...item, id } : i));
      mudou();
    },
    remover(id) {
      itens = itens.filter((i) => i.id !== id);
      mudou();
    },
    /** Salgados e doces avulsos: uma linha por produto; quantidade 0 remove a linha. */
    definirQuantidade(produtoId, qtd) {
      const existente = itens.find((i) => i.tipo === "unidade" && i.produto === produtoId);
      if (qtd <= 0) itens = itens.filter((i) => i !== existente);
      else if (existente) itens = itens.map((i) => (i === existente ? { ...i, qtd } : i));
      else itens = [...itens, { tipo: "unidade", produto: produtoId, qtd, id: novoId() }];
      mudou();
    },
    quantidadeDe(produtoId) {
      return itens.find((i) => i.tipo === "unidade" && i.produto === produtoId)?.qtd ?? 0;
    },
    limpar() {
      itens = [];
      mudou();
    },
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };
}
