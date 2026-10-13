# Concluir o DR Control

Concluir o fluxo da especificação original: **SPY → demanda → produção → aprovação → publicação → resultados**, mantendo os dados existentes e o visual atual.

## 1. Resolver a lentidão e validar a base
- Evitar recarregar toda a operação após cada alteração; atualizar apenas os dados afetados.
- Manter as telas disponíveis durante atualizações e reutilizar dados já carregados ao navegar.
- Testar criação e edição de ofertas, demandas individuais e lotes, atribuição de editores e envio de vídeos privados com uma conta autenticada.
- Medir abertura, navegação e salvamento antes e depois, sem reduzir as verificações de segurança.

## 2. Central de SPY
- Cadastro, edição e arquivamento de referências com plataforma, links, copy, hook, CTA, país, idioma, nicho, produto, oferta opcional, data, observações e tags.
- Vídeos e imagens privados, favoritos, pesquisa e filtros.
- Criar demanda individual ou lote a partir das referências selecionadas, aproveitando os textos e anexos; permitir usar uma referência em um lote existente.

## 3. Biblioteca, produção e aprovações
- Biblioteca com pesquisa e filtros, código do criativo, oferta, editor, país, idioma, formato, copy e arquivos.
- Visualização de vídeos e imagens, download e histórico de versões sem sobrescrita.
- Fila de revisão para o administrador aprovar uma versão específica ou solicitar ajustes com observações.
- Impedir aprovação sem arquivo final e manter produção, aprovação, publicação e desempenho separados.
- Classificação de desempenho e criação de novas demandas de variação.
- Manter a lista e o Kanban de tarefas atribuídas aos editores.

## 4. Fila de publicação
- Disponibilizar cada versão aprovada ao gestor de tráfego, sem esperar a conclusão do lote.
- Visualizar e baixar o arquivo aprovado e copiar a copy.
- Registrar ID e link do anúncio, campanha, conjunto, responsável, data e status.
- Permitir múltiplas publicações do mesmo criativo.

## 5. Performance e visão geral
- Registrar resultados diários por oferta e, opcionalmente, por criativo: anúncios, faturamento, pedidos, leads, produtos, entrega, taxas e outros custos.
- Calcular ROAS, CPL, CPA, investimento total, lucro e ROI, tratando divisão por zero.
- Preservar a moeda original e a taxa utilizada quando houver conversão; nunca somar moedas diferentes diretamente.
- Filtros por período, país, oferta e moeda, gráficos de evolução e indicadores reais.
- Completar as abas das ofertas com anúncios, SPY, copies, performance e arquivos relacionados.

## 6. Notificações e configurações
- Notificações internas de atribuição, prazos próximos ou atrasados, envio para revisão, ajustes, aprovação e publicação.
- Indicador de não lidas e opção de marcar como lidas.
- Completar nome, avatar privado, aparência e alteração de senha.

## Segurança e implementação
- Reutilizar as páginas e componentes existentes; substituir as telas “próxima etapa” por funcionalidades reais.
- Ampliar o banco com referências, revisões, publicações, registros financeiros e notificações, com índices e permissões por função.
- Validar alterações no servidor; manter convites exclusivos do administrador e arquivos privados com acesso controlado.
- Usar carregamentos e atualizações separados por área, evitando ampliar o carregamento global que causa lentidão.
- Preservar os registros existentes e não inserir dados fictícios em produção.

## Critério de conclusão
- Exercitar o fluxo autenticado completo, confirmando persistência, arquivos privados, revisões, publicações e cálculos financeiros.
- Testar as permissões de administrador, editor, SPY e gestor de tráfego e as regras essenciais com testes automatizados.
- Conferir as telas em diferentes tamanhos, os erros de execução e todas as páginas pendentes.
- Publicação no Meta Ads e alimentação financeira serão manuais nesta entrega; integrações automáticas ficam fora do escopo.
- Não publicar o site sem sua solicitação.