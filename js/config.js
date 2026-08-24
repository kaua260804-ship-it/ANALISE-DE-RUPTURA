const CONFIG = {
    pageSize: 50,
    fileNames: {
        estoque: 'BASE ESTOQUE.xlsx',
        cadastro: 'BASE CADASTRO.xlsx',
        venda: [
            'VENDA 2026.xlsx',
            'VENDA2026.xlsx',
            'VENDA 26.xlsx',
            'VENDA26.xlsx',
            'VENDA.xlsx',
            'VENDAS.xlsx'
        ]
    },
    sheetNames: {
        estoqueLoja: ['ESTOQUE DA LOJAS', 'ESTOQUE LOJA', 'ESTOQUE LOJAS', 'LOJA'],
        estoqueCDBR: ['ESTOQUE CDBR', 'CDBR', 'CENTRO DE DISTRIBUIÇÃO'],
        venda: ['VENDA', 'VENDAS', 'VENDA 2026', 'VENDA2026'],
        cadastro: ['ARVORE', 'ÁRVORE', 'CADASTRO', 'BASE']
    },
    columns: {
        codigoProduto: ['Código Produto', 'Codigo Produto', 'CODIGO PRODUTO'],
        produto: ['Produto', 'PRODUTO'],
        empresa: ['Empresa', 'EMPRESA'],
        quantidadeDisponivel: ['Quantidade Disponível', 'QUANTIDADE DISPONIVEL'],
        precoVenda: ['Preço Vda Unitário', 'PRECO VDA UNITARIO'],
        qtdPendenteCompra: ['Qtd. Pend. Ped.Compra', 'QTD PEND PED COMPRA'],
        qtdPendenteExpedicao: ['Qtd. Pend. Ped.Exped.', 'QTD PEND PED EXPED'],
        mediaVendaDia: ['Média Vda/Dia', 'MEDIA VDA DIA'],
        diasUltimaEntrada: ['Dias Ult. Entrada', 'DIAS ULT ENTRADA'],
        diasSemVendas: ['Quantidade Dias Sem Vendas', 'QTD DIAS SEM VENDAS'],
        codigoC5: ['Codigo C5', 'CODIGO C5', 'Código C5'],
        loja: ['Loja', 'LOJA'],
        qtd: ['Qtd', 'QTD', 'Quantidade'],
        totalR: ['Total R$', 'TOTAL R$', 'Total RS', 'TOTAL RS'],
        seqProd: ['SEQ PROD', 'SEQ_PROD', 'Seq Prod'],
        comprador: ['COMPRADOR'],
        categoria: ['CATEGORIA'],
        grupo: ['GRUPO'],
        subgrupo: ['SUBGRUPO'],
        subgrupo1: ['SUBGRUPO 1', 'SUBGRUPO1'],
        codigoFornecedor: ['Código Fornecedor Principal', 'CODIGO FORNECEDOR PRINCIPAL'],
        custoBruto: ['Cto Bruto Unitário', 'CTO BRUTO UNITARIO']
    }
};