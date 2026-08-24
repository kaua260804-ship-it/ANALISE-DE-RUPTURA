class FilterManager {
    constructor() {
        this.filters = {
            mediaVdAcima: '',
            mediaVdAbaixo: '',
            codigoProduto: '',
            produto: '',
            empresas: [],
            compradores: [],
            categorias: [],
            grupos: [],
            subgrupos: [],
            ruptura: '',
            statusEstoque: [],
            temVenda: ''
        };
    }

    applyFilters(data) {
        return data.filter(item => {
            // Filtro de Média de Venda Acima
            if (this.filters.mediaVdAcima !== '' && this.filters.mediaVdAcima !== null) {
                const valorMinimo = parseFloat(this.filters.mediaVdAcima);
                if (!isNaN(valorMinimo) && item.mediaVendaMes < valorMinimo) {
                    return false;
                }
            }
            
            // Filtro de Média de Venda Abaixo
            if (this.filters.mediaVdAbaixo !== '' && this.filters.mediaVdAbaixo !== null) {
                const valorMaximo = parseFloat(this.filters.mediaVdAbaixo);
                if (!isNaN(valorMaximo) && item.mediaVendaMes > valorMaximo) {
                    return false;
                }
            }
            
            // Filtro de Código
            if (this.filters.codigoProduto && 
                !String(item.codigoProduto).toLowerCase().includes(this.filters.codigoProduto.toLowerCase())) {
                return false;
            }
            
            // Filtro de Produto
            if (this.filters.produto && 
                !String(item.produto).toLowerCase().includes(this.filters.produto.toLowerCase())) {
                return false;
            }
            
            // Filtro de Empresas (múltipla escolha)
            if (this.filters.empresas.length > 0 && 
                !this.filters.empresas.includes(item.empresa)) {
                return false;
            }
            
            // Filtro de Compradores (múltipla escolha)
            if (this.filters.compradores.length > 0 && 
                !this.filters.compradores.includes(item.comprador)) {
                return false;
            }
            
            // Filtro de Categorias (múltipla escolha)
            if (this.filters.categorias.length > 0 && 
                !this.filters.categorias.includes(item.categoria)) {
                return false;
            }
            
            // Filtro de Grupos (múltipla escolha)
            if (this.filters.grupos.length > 0 && 
                !this.filters.grupos.includes(item.grupo)) {
                return false;
            }
            
            // Filtro de Subgrupos (múltipla escolha)
            if (this.filters.subgrupos.length > 0 && 
                !this.filters.subgrupos.includes(item.subgrupo)) {
                return false;
            }
            
            // Filtro de Ruptura
            if (this.filters.ruptura && item.ruptura !== this.filters.ruptura) {
                return false;
            }
            
            // Filtro de Status Estoque (múltipla escolha)
            if (this.filters.statusEstoque.length > 0 && 
                !this.filters.statusEstoque.includes(item.statusEstoque)) {
                return false;
            }
            
            // Filtro de Venda
            if (this.filters.temVenda === 'COM VENDA' && !item.temVenda) {
                return false;
            }
            
            if (this.filters.temVenda === 'SEM VENDA' && item.temVenda) {
                return false;
            }
            
            return true;
        });
    }

    setFilter(key, value) {
        this.filters[key] = value;
    }

    clearFilters() {
        this.filters = {
            mediaVdAcima: '',
            mediaVdAbaixo: '',
            codigoProduto: '',
            produto: '',
            empresas: [],
            compradores: [],
            categorias: [],
            grupos: [],
            subgrupos: [],
            ruptura: '',
            statusEstoque: [],
            temVenda: ''
        };
    }
}

window.FilterManager = FilterManager;
