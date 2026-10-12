# PLAN — site da Doce Maria

Fontes: RESPOSTAS.md (o que a mãe disse; fica só no computador do Diego) e [DECISOES.md](DECISOES.md) (o que foi decidido e por quê).

## 1. Problema e objetivo
A Doce Maria (Ipsep, Recife) vende bolos, doces e mini salgados só por encomenda, tudo pelo WhatsApp. Objetivo: **vender mais**. O cliente chega pelo link nos stories (Instagram `@docem.s` e status do WhatsApp) e pelo Google Maps, vê o cardápio com preço, monta o pedido e manda pronto no WhatsApp dela. Para o Diego: aprender a publicar e manter um site real.

**Fora do escopo:** pagamento online, login, banco de dados, registro de pedidos, estoque.

## 2. Regras de negócio (o carrinho obedece)
| Regra | Valor |
|---|---|
| Antecedência | 48 h a partir do momento do pedido; **5 dias** se tiver topo |
| Dias e horários de retirada/entrega | segunda a sábado, 8h às 20h, horários de hora em hora; domingo bloqueado; datas lotadas numa lista do catálogo |
| Primeira data possível | agora + 48 h, arredondado para a próxima hora cheia; se cair depois das 20h → 8h do dia seguinte; se cair no domingo → segunda 8h |
| Bolo decorado / temático | R$ 85/kg, 1 a 10 kg, de 0,5 em 0,5; massa branca ou chocolate; 1 ou 2 recheios (mais = combinar); redondo, retangular, vulcão ou de andar (andar: mínimo 1,5 kg) |
| Adicionais | Nutella, morango, bombom: + R$ 10/kg cada |
| Topo | "a partir de R$ 20, valor a confirmar"; pede foto de referência no WhatsApp |
| Bolo caseiro | R$ 65/kg, a partir de 1 kg, de 0,5 em 0,5 |
| Bolo de noiva pernambucano | R$ 100/kg, a partir de 1 kg, de 0,5 em 0,5 |
| Salgados | R$ 2 (coxinha, empada, bolinho de queijo); mínimo 25 no total, depois qualquer quantidade de cada sabor; sempre fritos (D24) |
| Empadão médio | 5 sabores, 1 a 10 por sabor; preço a confirmar (D23) |
| Doces | R$ 1,50; de 25 em 25 |
| Kits | 10 / 15 / 20 pessoas = R$ 230 / R$ 345 / R$ 460; 5 salgados e 3 doces por pessoa (D32) |
| Limite por pedido | 100 salgados, 100 doces, 10 kg de bolo (somando kits); acima disso → "fale com a Doce Maria" |
| Entrega | retirada grátis (Rua Rio Ipojuca, 60, Ipsep); entrega dela com taxa estimada por bairro até 10 km de carro, 54 bairros (D25, [BAIRROS.md](BAIRROS.md)); Uber/99 do cliente (bolo só de carro, D12) |
| Pagamento | Sinal de 50% no Pix depois da confirmação + 50% na entrega/retirada, ou 100% no Pix; com Uber/99 só 100%. Desistência: sinal não é devolvido (D31) |
| Item sem preço | aparece "a confirmar" e o total diz "+ itens a confirmar"; nunca um número inventado |

## 3. Arquitetura
```
catalogo.json  ──►  app.js (monta cardápio, carrinho, regras)  ──►  wa.me/5581988186706?text=...
                        │
                        └── localStorage: só os itens do carrinho (D2)
```
- `index.html` (uma página com âncoras), `css/estilo.css`, `js/` em módulos: `catalogo.js` (carrega e valida), `carrinho.js`, `regras.js` (datas, limites, taxa — funções puras), `mensagem.js` (monta o texto do WhatsApp), `ui.js`.
- `catalogo.json`: produtos, preços, opções, mínimos e passos, bairros e taxas, datas bloqueadas. Único arquivo que muda quando ela troca preço.
- Imagens em WebP, com largura certa para celular, `loading="lazy"`.
- **Testes** com o test runner do Node (`node --test`), sem dependência: regras de data (48 h, domingo, 20h, topo 5 dias, datas lotadas), taxa (2 km, 3,5 km, 10 km), limites e mínimos, preço de cada item e kit, mensagem do WhatsApp (acentos, emojis, `&`, `#` e quebras de linha passando pelo `encodeURIComponent`). Teste visual com Playwright em 360 px e desktop.
- **Checagem de catálogo** (`node scripts/validar-catalogo.mjs`): roda no GitHub Actions antes de publicar; se falhar, não publica.
- **Deploy:** GitHub Actions → GitHub Pages, organização `docemaria`.

## 4. Fases
| Fase | O que sai | Quem |
|---|---|---|
| 0. Design | Feito direto na 1ª versão (D20). O prompt do Claude Design fica como alternativa ([PROMPT_CLAUDE_DESIGN.md](PROMPT_CLAUDE_DESIGN.md)) | Feito (12/10) |
| 1. Esqueleto | Estrutura de pastas, HTML/CSS, catálogo com os preços reais | **1ª versão pronta (12/10)** |
| 2. Regras | `regras.js` + testes (datas, limites, taxa, preços) | **1ª versão pronta: 30 testes** |
| 3. Carrinho e mensagem | Montar bolo, kits, salgados e doces; formulário; mensagem; teste em Android e iPhone | **1ª versão pronta**; falta testar em celular de verdade |
| 4. Conteúdo real | Fotos dela tratadas, conferir a tabela de bairros no Google Maps, CNPJ | Diego + mãe |
| 5. Publicação | Organização `docemaria`, Pages via Actions, prévia do link (Open Graph com imagem), favicon, QR Code | Diego (ações públicas são dele) |
| 6. Depois do ar | WhatsApp Business dela (perfil, horário, resposta fora do horário, etiquetas), Perfil da Empresa no Google com o link, contador de acessos sem cookie, aviso se o site sair do ar | Diego + mãe |

Cada fase fecha com checkpoint e seção de aprendizado (regra 6.6 do CLAUDE.md).

## 5. Pendências que não travam o design
Só o CNPJ. A mãe revisa e acerta os detalhes quando o site estiver pronto (antes de publicar).
