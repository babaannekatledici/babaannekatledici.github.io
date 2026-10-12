# Prompt para o Claude Design

> **Desatualizado (12/10/2026):** a 1ª versão do site foi feita direto no código (D20) e o cardápio mudou depois disso (bolinho de queijo, empadão, 10 km, salgados sempre fritos: D22–D26). Se for usar este prompt, atualize antes.

Copie tudo abaixo da linha e cole no Claude Design.

---

Quero o design e um protótipo navegável do site de encomendas da **Doce Maria**, uma doceria caseira do Ipsep, em Recife (PE). O site é real e vai ao ar para clientes de verdade. Todo o texto do site é em **português do Brasil**.

## 1. O negócio
- A Doce Maria faz bolos, doces e mini salgados **só por encomenda**, com **48 horas de antecedência**. Não tem pronta entrega.
- Hoje os pedidos chegam pelo WhatsApp. O site **não substitui o WhatsApp**: o cliente vê o cardápio com preços, monta o pedido num carrinho, escolhe data e forma de entrega, e o botão final **abre o WhatsApp da Doce Maria com a mensagem do pedido já escrita**. Ela confirma a data e manda a chave Pix para o pagamento.
- Não tem pagamento online, login, cadastro nem conta. O site não guarda dados de ninguém.

## 2. Quem usa
- Quase todo mundo chega **pelo celular**, tocando no link dos stories do Instagram (`@docem.s`) ou do status do WhatsApp, ou pelo Google Maps. Projete **primeiro para 360–414 px** de largura e depois adapte para desktop.
- Pessoas comuns de Recife e Região Metropolitana encomendando aniversário, festa pequena ou lanche. Muitas não têm intimidade com tecnologia: botões grandes, textos curtos, nada escondido atrás de gesto.

## 3. Marca e estilo
- Nome: **Doce Maria**. Ainda não existe logo: crie um **logotipo só com o nome** (tipográfico, delicado), fácil de trocar depois por uma logo que a dona vai escolher. Faça também uma versão pequena para o ícone da aba e do atalho no celular.
- Estilo pedido pela dona: **delicado**, com paleta **branco e rosa**. Use branco e tons de rosa (claro para fundos e cartões, um rosa mais forte para botões e destaques). Para o texto, um tom escuro neutro e quente (por exemplo, um cacau bem escuro) para ler bem. Não introduza outras cores de destaque.
- Contraste mínimo WCAG AA em todo texto e botão (inclusive texto branco sobre o rosa do botão).
- No máximo duas fontes do Google Fonts: uma com personalidade para títulos e o logotipo, uma muito legível para o resto.
- Fotos: use **marcadores de foto** bem identificados (ex.: "FOTO: bolo decorado redondo"). Não use fotos de produtos de outras confeitarias; as fotos reais da dona entram depois. O layout precisa ficar bonito com fotos de celular comuns (proporção quadrada ou 4:5).

## 4. Estrutura (uma página com âncoras + carrinho)
1. **Cabeçalho fixo:** logotipo, menu (Kits, Bolos, Salgados, Doces, Como funciona) e ícone do carrinho com a quantidade de itens. No celular, menu compacto.
2. **Abertura:** frase curta tipo "Bolos, doces e salgados feitos por encomenda no Ipsep", com o botão "Ver cardápio" e três selos: "Encomende com 48h de antecedência", "Entrega no Recife e Região Metropolitana", "Retirada grátis no Ipsep".
3. **Como funciona** em 4 passos: monte seu pedido → escolha data e entrega → envie pelo WhatsApp → a Doce Maria confirma e você paga (Pix, ou dinheiro na entrega ou na retirada).
4. **Kits festa** (seção em destaque, logo depois da abertura). Três cartões lado a lado no desktop e em sequência no celular. Em cada um, o **número de pessoas em destaque**:
   | Kit | Serve | Bolo decorado | Salgados (coxinha e empada) | Doces | Preço |
   |---|---|---|---|---|---|
   | Kit Festa 10 | **10 pessoas** | 1 kg | 50 | 50 | R$ 260,00 |
   | Kit Festa 15 | **15 pessoas** | 1,5 kg | 75 | 75 | R$ 390,00 |
   | Kit Festa 20 | **20 pessoas** | 2 kg | 100 | 100 | R$ 520,00 |
   Mostre também "≈ R$ 26 por pessoa". Ao escolher um kit, o cliente personaliza sem mudar o preço: massa, 1 ou 2 recheios e formato do bolo (de andar só nos kits de 15 e 20, porque exige no mínimo 1,5 kg); a divisão entre coxinha e empada; a divisão entre brigadeiro, beijinho e bem casado (de 25 em 25); frito ou congelado. Os adicionais do bolo e o topo funcionam como no bolo avulso e somam ao preço do kit.
5. **Bolos decorados / temáticos** (montador de bolo):
   - R$ 85,00 o kg. Peso de 1 kg a 10 kg, de 0,5 em 0,5 kg. Mostrar quantas fatias serve (1 kg ≈ 10 a 12 fatias).
   - Massa: branca (baunilha) ou chocolate.
   - Recheio (até 2, sem mudar o preço): chocolate, ninho, doce de leite, bem casado, prestígio, ninho com geleia de morango. Uma linha discreta: "Quer mais recheios? Combine pelo WhatsApp."
   - Formato: redondo, retangular, vulcão ou de andar (mesmo preço por kg; de andar a partir de 1,5 kg).
   - Cobertura: chantilly espatulado (incluso). Campo "Cores ou tema da decoração".
   - Adicionais (pode marcar mais de um): Nutella, morango fresco, bombom, cada um + R$ 10,00 por kg.
   - Topo de bolo (papel impresso 3D): "a partir de R$ 20,00, valor a confirmar"; ao marcar, avisar que exige **5 dias de antecedência** e que o tema é combinado mandando uma foto de referência no WhatsApp.
   - O preço atualiza na hora conforme o peso e os adicionais.
6. **Bolos caseiros:** macaxeira, fubá e massa puba, R$ 65,00 o kg, a partir de 1 kg, de 0,5 em 0,5 kg (1 kg ≈ 8 fatias). **Bolo de noiva pernambucano** com glacê mármore, R$ 100,00 o kg, a partir de 1 kg, de 0,5 em 0,5 kg.
7. **Mini salgados (30 g):** coxinha de frango R$ 2,00, empada de frango R$ 2,00, pão delícia com frango cremoso R$ 3,00. Mínimo de 25 salgados no pedido, somando os sabores; depois disso, qualquer quantidade de cada sabor (seletor + / − de 5 em 5, com campo para digitar). Escolher frito ou congelado.
8. **Doces:** brigadeiro, beijinho e bem casado, R$ 1,50 cada, de 25 em 25.
9. **Sob consulta:** bolos de época (Dia das Mães, São João, Natal). Cartão sem preço, com botão "Perguntar no WhatsApp" que abre a conversa com uma frase pronta (ex.: "Olá! Vi no site e quero saber sobre os bolos de São João.").
10. **Entrega e retirada:**
    - Retirada grátis: Rua Rio Ipojuca, 60, Ipsep, Recife.
    - Entrega feita pela Doce Maria até 6 km de carro: R$ 7,00 até 2 km, mais R$ 1,50 por km depois disso. O cliente escolhe o bairro numa lista e vê a **taxa estimada**; "outro bairro" fica "a confirmar". Lista: Ipsep e Imbiribeira R$ 7,00; Areias R$ 8,50; Boa Viagem e Caçote R$ 10,00; Barro, Estância, Ibura e Jiquiá R$ 11,50; Afogados, Cabanga, Cohab e Joana Bezerra R$ 13,00.
    - O cliente também pode chamar Uber ou 99 por conta própria. **Bolo só de carro**; moto só para pedidos sem bolo.
    - Segunda a sábado, das 8h às 20h. **Domingo não há entrega nem retirada.**
11. **Pagamento e combinados:** **Pix** do valor total, depois que a Doce Maria confirma a data e os valores, ou **dinheiro na entrega ou na retirada**. Depois de confirmado, o pedido não pode ser alterado. Se o cliente desistir até 12 horas antes do horário marcado, a Doce Maria devolve 70% do valor pago. Mensagens respondidas até as 19h.
12. **Depoimentos:** desenhe o componente, mas marque que **só aparece quando houver depoimentos reais** (não invente nenhum).
13. **Instagram:** chamada para seguir `@docem.s`.
14. **Rodapé:** Doce Maria, CNPJ (marcador "CNPJ: 00.000.000/0001-00" até termos o número), endereço, horários, WhatsApp (81) 98818-6706 e Instagram.

## 5. Carrinho e finalização (a parte mais importante)
- No celular, uma **barra fixa embaixo** aparece quando há itens: "3 itens · R$ 390,00 · Ver pedido". Ela abre o carrinho em tela cheia (bottom sheet); no desktop, painel lateral.
- **Itens:** cada um com o resumo das escolhas, subtotal, botões editar e remover.
- **Dados do pedido:** nome; data (calendário que não deixa escolher domingo, datas antes do prazo mínimo nem datas lotadas) e horário (de hora em hora, 8h às 20h); forma de receber (retirada, entrega da Doce Maria, ou "vou chamar Uber/99"); se for entrega: bairro (lista), endereço e ponto de referência; forma de pagamento para todos (Pix, ou dinheiro na entrega feita pela Doce Maria ou na retirada; quem chama Uber/99 paga só no Pix); campo "Observações (alergia, tema, cores)".
- **Resumo:** subtotal, taxa de entrega (estimada ou a confirmar), total e, quando houver, "+ itens a confirmar" (topo).
- Um quadro curto com os combinados (Pix do valor total depois da confirmação ou dinheiro na entrega/retirada; pedido confirmado não pode ser alterado; desistência até 12 h antes devolve 70%) logo acima do botão.
- Botão principal: **"Enviar pedido pelo WhatsApp"**, com o ícone do WhatsApp.
- Depois do toque, uma tela de confirmação: "Seu pedido abriu no WhatsApp. É só tocar em enviar. A Doce Maria confirma a data e os valores e manda a chave Pix."
- **Mensagens de erro e aviso** claras e gentis, perto do campo, por exemplo: "Faltam 15 salgados para o mínimo de 25 no pedido", "Com topo, a data mínima é 5 dias a partir de hoje", "Para mais de 100 salgados num dia, fale direto com a Doce Maria", "Bolo vai de carro: para moto, só salgados e doces", "Bolo de andar a partir de 1,5 kg".
- Estados para desenhar: carrinho vazio, item adicionado (aviso discreto), erro de validação, pedido grande demais, confirmação.

Mensagem que o botão monta no WhatsApp (mostrar como prévia no protótipo):
```text
Olá, Doce Maria! Quero fazer uma encomenda pelo site 🎂
👤 Nome: Maria Silva
📅 Para: sábado, 18/10, às 15h
🚗 Entrega: Rua X, 123, Boa Viagem (taxa estimada R$ 10,00)
💳 Pagamento: Pix

1x Kit Festa 15 pessoas ........ R$ 390,00
   Bolo 1,5 kg redondo | Massa: chocolate | Recheios: ninho, prestígio
   + Morango fresco ............ R$ 15,00
   + Topo de bolo (valor a confirmar)
   Salgados: 50 coxinhas, 25 empadas (fritos)
   Doces: 50 brigadeiros, 25 beijinhos
25x Pão delícia ................ R$ 75,00

Subtotal: R$ 480,00
Entrega: R$ 10,00 (estimada)
Total: R$ 490,00 + topo (a confirmar)
📝 Observações: tema Frozen, tons de azul

Aguardo a confirmação da data e a chave Pix para o pagamento.
```

## 6. O que NÃO fazer
- Nada de preço inventado: o que não tem preço aparece como "a confirmar" ou "sob consulta".
- Nada de depoimento, avaliação, número de clientes ou selo inventado.
- Nada de mostrar chave Pix, pedir pagamento, login, cadastro, pop-up de newsletter ou banner de cookies (o site não usa cookie de rastreio).
- Nada de animação pesada, carrossel automático ou vídeo de fundo: o site precisa abrir rápido no 4G.

## 7. O que eu preciso receber
1. Logotipo tipográfico "Doce Maria" (versão completa e ícone).
2. Paleta com nomes e códigos (branco, rosas, texto escuro, estados de erro e sucesso) e as duas fontes, como variáveis CSS.
3. Componentes: botão principal e secundário, cartão de produto, cartão de kit, seletor de quantidade (+ / −, com passos de 25 ou 0,5 kg), chips de escolha (massa, recheio), aviso de erro, barra do carrinho, bottom sheet.
4. Telas no celular (360 px): página inteira, montador de bolo, personalização de kit, carrinho, finalização, confirmação. E a página inteira no desktop (1280 px).
5. Protótipo navegável do fluxo: escolher kit → personalizar → carrinho → dados → prévia da mensagem → confirmação.
6. Código em **HTML, CSS e JavaScript puro**, sem framework, com cores e espaçamentos em variáveis CSS e os produtos e preços separados do layout (uma lista de dados), porque a implementação final, os testes e a publicação vão ser feitos depois em outro lugar.
