class FilterManager {
    constructor() {
        this.filters = {
            searchGlobal: '',
            codigoProduto: '',
            produto: '',
            empresa: '',
            comprador: '',
            categoria: '',
            grupo: '',
            subgrupo: '',
            ruptura: '',
            statusEstoque: '',
            temVenda: ''
        };
    }

    applyFilters(data) {
        return data.filter(item => {
            // Busca global
            if (this.filters.searchGlobal) {
                const searchStr = JSON.stringify(item).toLowerCase();
                if (!searchStr.includes(this.filters.searchGlobal.toLowerCase())) {
                    return false;
                }
            }
            
            // Filtros específicos
            if (this.filters.codigoProduto && 
                !String(item.codigoProduto).toLowerCase().includes(this.filters.codigoProduto.toLowerCase())) {
                return false;
            }
            
            if (this.filters.produto && 
                !String(item.produto).toLowerCase().includes(this.filters.produto.toLowerCase())) {
                return false;
            }
            
            if (this.filters.empresa && item.empresa !== this.filters.empresa) {
                return false;
            }
            
            if (this.filters.comprador && item.comprador !== this.filters.comprador) {
                return false;
            }
            
            if (this.filters.categoria && item.categoria !== this.filters.categoria) {
                return false;
            }
            
            if (this.filters.grupo && item.grupo !== this.filters.grupo) {
                return false;
            }
            
            if (this.filters.subgrupo && item.subgrupo !== this.filters.subgrupo) {
                return false;
            }
            
            if (this.filters.ruptura && item.ruptura !== this.filters.ruptura) {
                return false;
            }
            
            if (this.filters.statusEstoque && item.statusEstoque !== this.filters.statusEstoque) {
                return false;
            }
            
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
            searchGlobal: '',
            codigoProduto: '',
            produto: '',
            empresa: '',
            comprador: '',
            categoria: '',
            grupo: '',
            subgrupo: '',
            ruptura: '',
            statusEstoque: '',
            temVenda: ''
        };
    }
}

window.FilterManager = FilterManager;