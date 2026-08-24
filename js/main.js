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
            console.error
