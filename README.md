# Doce Maria

Site de encomendas da **Doce Maria**: bolos, doces e salgados feitos por encomenda no Ipsep, Recife.
O cliente monta o pedido no site e ele chega pronto no WhatsApp da Doce Maria, que confirma a data e o pagamento.

**Endereço:** https://docemaria.github.io (prévia; ainda fora do Google)

## Como funciona

- Página estática em HTML, CSS e JavaScript puro, sem servidor e sem banco de dados.
- O site não guarda dados de ninguém: nome e endereço vão só na mensagem do WhatsApp. O carrinho fica apenas no aparelho do cliente.
- Preços, produtos, bairros e regras ficam num único arquivo: [`site/dados/catalogo.json`](site/dados/catalogo.json).

## Mudar um preço

1. Edite o valor em `site/dados/catalogo.json`.
2. Rode `npm test` e `npm run validar:publicar`.
3. Faça commit e push na `main`. O GitHub Actions testa de novo e publica sozinho.

Se algum preço estiver vazio ou absurdo, se faltar foto ou se houver foto sem licença, a publicação é barrada.

## Rodar no computador

```bash
npm test                 # testes das regras (preços, datas, taxa, mensagem)
npm run validar          # checagem do catálogo
npm run servir           # abre em http://127.0.0.1:8000
```

Precisa de Node 22 ou mais novo e Python 3, sem nenhuma dependência para instalar.

## Fotos

As fotos atuais são **ilustrativas**, de banco de imagens com licença livre (créditos no rodapé do site). Elas serão trocadas pelas fotos dos produtos da Doce Maria.
