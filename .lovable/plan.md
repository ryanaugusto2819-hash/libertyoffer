# Remover anúncio da oferta

## O que será feito
- Adicionar um botão de lixeira em cada anúncio da aba **Anúncios**, visível apenas para administradores.
- Pedir confirmação pelo nome do anúncio para evitar exclusões acidentais.
- Excluir o anúncio e seus dados vinculados: versões, avaliações, publicações, métricas, comentários, notificações e arquivos privados.
- Atualizar a lista imediatamente após a exclusão e informar o resultado na tela.

## Detalhes técnicos
- A exclusão será uma operação única e validada no backend, com verificação real da função de administrador.
- Se o anúncio for o único item de uma demanda individual, a demanda vazia também será removida.
- Os arquivos serão removidos do armazenamento privado após a limpeza dos registros.
- Será incluído teste para a confirmação obrigatória da exclusão.
