class DataAnalysisApp {
    constructor() {
        this.processor = new DataProcessor();
        this.filterManager = new FilterManager();
        this.dashboardManager = new DashboardManager();
        this.chartManager = new ChartManager();
        
        this.filteredData = [];
        this.currentPage = 1;
        this.sortField = null;
        this.sortOrder = 'asc';
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    initializeElements() {
        this.elements = {
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            tableBody: document.getElementById('tableBody'),
            filterMediaVdAcima: document.getElementById('filterMediaVdAcima'),
            filterMediaVdAbaixo: document.getElementById('filterMediaVdAbaixo'),
            filterCodigo: document.getElementById('filterCodigo'),
            filterProduto: document.getElementById('filterProduto'),
            filterEmpresa: document.getElementById('filterEmpresa'),
            filterComprador: document.getElementById('filterComprador'),
            filterCategoria: document.getElementById('filterCategoria'),
            filterGrupo: document.getElementById('filterGrupo'),
            filterSubgrupo: document.getElementById('filterSubgrupo'),
            filterRuptura: document.getElementById('filterRuptura'),
            filterStatusEstoque: document.getElementById('filterStatusEstoque'),
            filterTemVenda: document.getElementById('filterTemVenda'),
            btnReload: document.getElementById('btnReload'),
            btnLimparFiltros: document.getElementById('btnLimparFiltros'),
            btnExportCSV: document.getElementById('btnExportCSV'),
            btnExportExcel: document.getElementById('btnExportExcel'),
            btnAnterior: document.getElementById('btnAnterior'),
            btnProxima: document.getElementById('btnProxima'),
            pageInfo: document.getElementById('pageInfo')
        };
    }

    bindEvents() {
        // Filtros de Média de Venda
        this.elements.filterMediaVdAcima.addEventListener('input', (e) => {
            this.filterManager.setFilter('mediaVdAcima', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterMediaVdAbaixo.addEventListener('input', (e) => {
            this.filterManager.setFilter('mediaVdAbaixo', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        // Filtros específicos
        this.elements.filterCodigo.addEventListener('input', (e) => {
            this.filterManager.setFilter('codigoProduto', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterProduto.addEventListener('input', (e) => {
            this.filterManager.setFilter('produto', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        // Filtros de múltipla escolha
        this.elements.filterEmpresa.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('empresas', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterComprador.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('compradores', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterCategoria.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('categorias', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterGrupo.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('grupos', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterSubgrupo.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('subgrupos', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterRuptura.addEventListener('change', (e) => {
            this.filterManager.setFilter('ruptura', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterStatusEstoque.addEventListener('change', (e) => {
            const selectedValues = Array.from(e.target.selectedOptions).map(opt => opt.value);
            this.filterManager.setFilter('statusEstoque', selectedValues);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        this.elements.filterTemVenda.addEventListener('change', (e) => {
            this.filterManager.setFilter('temVenda', e.target.value);
            this.currentPage = 1;
            this.applyFilters();
        });
        
        // Botões
        this.elements.btnReload.addEventListener('click', () => this.loadData());
        
        this.elements.btnLimparFiltros.addEventListener('click', () => {
            this.clearFilters();
        });
        
        this.elements.btnExportCSV.addEventListener('click', () => {
            this.exportData('csv');
        });
        
        this.elements.btnExportExcel.addEventListener('click', () => {
            this.exportData('excel');
        });
        
        this.elements.btnAnterior.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });
        
        this.elements.btnProxima.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / CONFIG.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });
        
        // Ordenação
        document.querySelectorAll('#dataTable th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                this.sortData(field);
            });
        });
    }

    async initializeApp() {
        await this.loadData();
    }

    async loadData() {
        try {
            this.showLoading();
            this.hideError();
            
            await this.processor.loadAllData();
            this.processor.processData();
            
            this.updateFilters();
            this.applyFilters();
            this.hideLoading();
            
            console.log('Dados carregados com sucesso!');
        } catch (error) {
            this.hideLoading();
            this.showError(`Erro ao carregar dados: ${error.message}`);
            console.error('Erro detalhado:', error);
        }
    }

    showLoading() {
        this.elements.loadingIndicator.style.display = 'block';
        this.elements.btnReload.disabled = true;
    }

    hideLoading() {
        this.elements.loadingIndicator.style.display = 'none';
        this.elements.btnReload.disabled = false;
    }

    showError(message) {
        this.elements.errorMessage.style.display = 'block';
        this.elements.errorMessage.textContent = message;
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }

    updateFilters() {
        const data = this.processor.getProcessedData();
        
        this.updateSelectOptions(this.elements.filterEmpresa, this.processor.getUniqueValues('empresa'));
        this.updateSelectOptions(this.elements.filterComprador, this.processor.getUniqueValues('comprador'));
        this.updateSelectOptions(this.elements.filterCategoria, this.processor.getUniqueValues('categoria'));
        this.updateSelectOptions(this.elements.filterGrupo, this.processor.getUniqueValues('grupo'));
        this.updateSelectOptions(this.elements.filterSubgrupo, this.processor.getUniqueValues('subgrupo'));
    }

    updateSelectOptions(selectElement, values) {
        const currentValues = Array.from(selectElement.selectedOptions).map(opt => opt.value);
        selectElement.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos';
        selectElement.appendChild(defaultOption);
        
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
        
        // Restaurar seleção anterior
        if (currentValues.length > 0) {
            Array.from(selectElement.options).forEach(option => {
                if (currentValues.includes(option.value)) {
                    option.selected = true;
                }
            });
        }
    }

    applyFilters() {
        const data = this.processor.getProcessedData();
        
        this.filteredData = this.filterManager.applyFilters(data);
        
        this.currentPage = 1;
        this.renderTable();
        this.dashboardManager.updateDashboard(this.filteredData);
    }

    sortData(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }
        
        this.filteredData.sort((a, b) => {
            const aVal = a[field] || '';
            const bVal = b[field] || '';
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            const comparison = String(aVal).localeCompare(String(bVal), 'pt-BR');
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        this.renderTable();
    }

    getRupturaBadge(ruptura) {
        const badges = {
            'RUPTURA LOJA': 'badge-ruptura-loja',
            'RUPTURA GERAL': 'badge-ruptura-geral',
            'POSSIVEL RUPTURA': 'badge-possivel-ruptura',
            'SEM RUPTURA': 'badge-sem-ruptura'
        };
        
        return `<span class="${badges[ruptura] || 'badge-secondary'}">${ruptura || 'SEM RUPTURA'}</span>`;
    }

    formatNumber(value) {
        if (value === null || value === undefined) return '0';
        return Number(value).toLocaleString('pt-BR');
    }

    formatCurrency(value) {
        if (value === null || value === undefined) return 'R$ 0,00';
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    renderTable() {
        const startIndex = (this.currentPage - 1) * CONFIG.pageSize;
        const endIndex = startIndex + CONFIG.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        this.elements.tableBody.innerHTML = '';
        
        if (pageData.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 12;
            cell.style.textAlign = 'center';
            cell.style.padding = '2rem';
            cell.textContent = 'Nenhum dado encontrado';
            row.appendChild(cell);
            this.elements.tableBody.appendChild(row);
        } else {
            pageData.forEach(item => {
                const row = document.createElement('tr');
                
                const codigoProduto = item.codigoProduto || '';
                const produto = item.produto || '';
                const empresa = item.empresa || '';
                const quantidadeDisponivel = item.quantidadeDisponivel || 0;
                const quantidadeDisponivelCDBR = item.quantidadeDisponivelCDBR || 0;
                const mediaVendaMes = item.mediaVendaMes || 0;
                const mediaVendaMesR = item.mediaVendaMesR || 0;
                const ruptura = item.ruptura || 'SEM RUPTURA';
                const comprador = item.comprador || '';
                const categoria = item.categoria || '';
                const grupo = item.grupo || '';
                const subgrupo = item.subgrupo || '';
                
                row.innerHTML = `
                    <td>${codigoProduto}</td>
                    <td title="${produto}">${produto.length > 40 ? produto.substring(0, 40) + '...' : produto}</td>
                    <td>${empresa}</td>
                    <td>${this.formatNumber(quantidadeDisponivel)}</td>
                    <td>${this.formatNumber(quantidadeDisponivelCDBR)}</td>
                    <td>${Number(mediaVendaMes).toFixed(2)}</td>
                    <td>${this.formatCurrency(mediaVendaMesR)}</td>
                    <td>${this.getRupturaBadge(ruptura)}</td>
                    <td>${comprador}</td>
                    <td>${categoria}</td>
                    <td>${grupo}</td>
                    <td>${subgrupo}</td>
                `;
                
                this.elements.tableBody.appendChild(row);
            });
        }
        
        const totalPages = Math.ceil(this.filteredData.length / CONFIG.pageSize);
        this.elements.pageInfo.textContent = `Página ${this.currentPage} de ${totalPages || 1}`;
        this.elements.btnAnterior.disabled = this.currentPage <= 1;
        this.elements.btnProxima.disabled = this.currentPage >= totalPages;
    }

    clearFilters() {
        this.filterManager.clearFilters();
        
        this.elements.filterMediaVdAcima.value = '';
        this.elements.filterMediaVdAbaixo.value = '';
        this.elements.filterCodigo.value = '';
        this.elements.filterProduto.value = '';
        this.elements.filterEmpresa.selectedIndex = -1;
        this.elements.filterComprador.selectedIndex = -1;
        this.elements.filterCategoria.selectedIndex = -1;
        this.elements.filterGrupo.selectedIndex = -1;
        this.elements.filterSubgrupo.selectedIndex = -1;
        this.elements.filterRuptura.value = '';
        this.elements.filterStatusEstoque.selectedIndex = -1;
        this.elements.filterTemVenda.value = '';
        
        this.currentPage = 1;
        this.applyFilters();
    }

    exportData(format) {
        if (this.filteredData.length === 0) {
            alert('Não há dados para exportar');
            return;
        }
        
        const exportData = this.filteredData.map(item => ({
            'Codigo Produto': item.codigoProduto,
            'Produto': item.produto,
            'Empresa': item.empresa,
            'Estq LJ': item.quantidadeDisponivel,
            'Estq CDBR': item.quantidadeDisponivelCDBR,
            'Media Vda Mes': item.mediaVendaMes,
            'Media Vda Mes R$': item.mediaVendaMesR,
            'Ruptura': item.ruptura,
            'Status Estoque': item.statusEstoque,
            'Comprador': item.comprador,
            'Categoria': item.categoria,
            'Grupo': item.grupo,
            'Subgrupo': item.subgrupo,
            'Preco Venda': item.precoVenda,
            'Qtd Pend Compra': item.qtdPendenteCompra,
            'Qtd Pend Exped': item.qtdPendenteExpedicao,
            'Media Vda Dia': item.mediaVendaDia,
            'Dias Ult Entrada': item.diasUltimaEntrada,
            'Dias Sem Vendas': item.diasSemVendas,
            'Cod Fornecedor': item.codigoFornecedor,
            'Custo Bruto Unit': item.custoBrutoUnitario
        }));
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dados');
        
        if (format === 'csv') {
            XLSX.writeFile(wb, 'dados_analise.csv');
        } else {
            XLSX.writeFile(wb, 'dados_analise.xlsx');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new DataAnalysisApp();
});
