/**
 * ChartManager - Gerenciador de visualizações
 * Substituído por mini tabelas para melhor performance e usabilidade
 */
class ChartManager {
    constructor() {
        this.initialized = false;
        this.containers = {};
    }

    /**
     * Inicializa os containers das visualizações
     */
    initialize() {
        if (this.initialized) return;
        
        this.containers = {
            topProdutos: document.getElementById('topProdutosTable'),
            categorias: document.getElementById('categoriasTable'),
            rupturas: document.getElementById('rupturasTable'),
            statusEstoque: document.getElementById('statusEstoqueTable')
        };
        
        this.initialized = true;
        console.log('ChartManager inicializado com mini tabelas');
    }

    /**
     * Atualiza todas as visualizações com dados filtrados
     * @param {Array} data - Dados processados e filtrados
     */
    updateCharts(data) {
        this.initialize();
        
        if (!data || data.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.renderTopProdutos(data);
        this.renderCategorias(data);
        this.renderRupturas(data);
        this.renderStatusEstoque(data);
    }

    /**
     * Renderiza top 10 produtos por quantidade
     */
    renderTopProdutos(data) {
        if (!this.containers.topProdutos) return;
        
        // Ordenar por quantidade disponível (loja + CDBR)
        const topProdutos = [...data]
            .map(item => ({
                ...item,
                quantidadeTotal: (item.quantidadeDisponivel || 0) + (item.quantidadeDisponivelCDBR || 0)
            }))
            .sort((a, b) => b.quantidadeTotal - a.quantidadeTotal)
            .slice(0, 10);
        
        if (topProdutos.length === 0) {
            this.containers.topProdutos.innerHTML = this.createEmptyMessage('Nenhum produto encontrado');
            return;
        }
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Produto</th>
                        <th>Estq LJ</th>
                        <th>Estq CDBR</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${topProdutos.map((item, index) => `
                        <tr>
                            <td><strong>${index + 1}</strong></td>
                            <td title="${item.produto}">${this.truncateString(item.produto, 30)}</td>
                            <td>${this.formatNumber(item.quantidadeDisponivel)}</td>
                            <td>${this.formatNumber(item.quantidadeDisponivelCDBR)}</td>
                            <td><strong>${this.formatNumber(item.quantidadeTotal)}</strong></td>
                            <td>${this.getStatusBadge(item.statusEstoque)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.containers.topProdutos.innerHTML = html;
    }

    /**
     * Renderiza distribuição por categoria
     */
    renderCategorias(data) {
        if (!this.containers.categorias) return;
        
        // Agrupar por categoria
        const categoriaMap = new Map();
        data.forEach(item => {
            const categoria = item.categoria || 'Sem Categoria';
            if (!categoriaMap.has(categoria)) {
                categoriaMap.set(categoria, {
                    nome: categoria,
                    quantidade: 0,
                    totalEstoque: 0,
                    rupturas: 0
                });
            }
            
            const catData = categoriaMap.get(categoria);
            catData.quantidade++;
            catData.totalEstoque += (item.quantidadeDisponivel || 0) + (item.quantidadeDisponivelCDBR || 0);
            if (item.ruptura.includes('RUPTURA')) {
                catData.rupturas++;
            }
        });
        
        const categorias = Array.from(categoriaMap.values())
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 15);
        
        if (categorias.length === 0) {
            this.containers.categorias.innerHTML = this.createEmptyMessage('Nenhuma categoria encontrada');
            return;
        }
        
        const totalProdutos = categorias.reduce((sum, cat) => sum + cat.quantidade, 0);
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Qtd Produtos</th>
                        <th>% do Total</th>
                        <th>Estoque Total</th>
                        <th>Rupturas</th>
                    </tr>
                </thead>
                <tbody>
                    ${categorias.map(cat => `
                        <tr>
                            <td title="${cat.nome}">${this.truncateString(cat.nome, 25)}</td>
                            <td><strong>${cat.quantidade}</strong></td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(cat.quantidade / totalProdutos * 100).toFixed(1)}%"></div>
                                    <span class="progress-text">${(cat.quantidade / totalProdutos * 100).toFixed(1)}%</span>
                                </div>
                            </td>
                            <td>${this.formatNumber(cat.totalEstoque)}</td>
                            <td>
                                <span class="${cat.rupturas > 0 ? 'text-danger' : 'text-success'}">
                                    ${cat.rupturas}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.containers.categorias.innerHTML = html;
    }

    /**
     * Renderiza resumo de rupturas
     */
    renderRupturas(data) {
        if (!this.containers.rupturas) return;
        
        const rupturaMap = new Map();
        data.forEach(item => {
            const ruptura = item.ruptura || 'SEM RUPTURA';
            if (!rupturaMap.has(ruptura)) {
                rupturaMap.set(ruptura, {
                    nome: ruptura,
                    quantidade: 0
                });
            }
            rupturaMap.get(ruptura).quantidade++;
        });
        
        const rupturas = Array.from(rupturaMap.values())
            .sort((a, b) => b.quantidade - a.quantidade);
        
        if (rupturas.length === 0) {
            this.containers.rupturas.innerHTML = this.createEmptyMessage('Nenhuma ruptura encontrada');
            return;
        }
        
        const total = rupturas.reduce((sum, rup) => sum + rup.quantidade, 0);
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>Status de Ruptura</th>
                        <th>Quantidade</th>
                        <th>% do Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rupturas.map(rup => `
                        <tr>
                            <td>${this.getRupturaBadge(rup.nome)}</td>
                            <td><strong>${rup.quantidade}</strong></td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill progress-${this.getRupturaColor(rup.nome)}" 
                                         style="width: ${(rup.quantidade / total * 100).toFixed(1)}%"></div>
                                    <span class="progress-text">${(rup.quantidade / total * 100).toFixed(1)}%</span>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.containers.rupturas.innerHTML = html;
    }

    /**
     * Renderiza status de estoque
     */
    renderStatusEstoque(data) {
        if (!this.containers.statusEstoque) return;
        
        const statusMap = new Map();
        data.forEach(item => {
            const status = item.statusEstoque || 'SEM ESTOQUE';
            if (!statusMap.has(status)) {
                statusMap.set(status, {
                    nome: status,
                    quantidade: 0,
                    valorTotal: 0
                });
            }
            
            const statusData = statusMap.get(status);
            statusData.quantidade++;
            statusData.valorTotal += (item.quantidadeDisponivel * item.precoVenda) + 
                                   (item.quantidadeDisponivelCDBR * item.custoBrutoUnitario);
        });
        
        const statusList = Array.from(statusMap.values())
            .sort((a, b) => b.quantidade - a.quantidade);
        
        if (statusList.length === 0) {
            this.containers.statusEstoque.innerHTML = this.createEmptyMessage('Nenhum status encontrado');
            return;
        }
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>Status Estoque</th>
                        <th>Qtd Produtos</th>
                        <th>Valor Estimado</th>
                    </tr>
                </thead>
                <tbody>
                    ${statusList.map(status => `
                        <tr>
                            <td>${this.getStatusEstoqueBadge(status.nome)}</td>
                            <td><strong>${status.quantidade}</strong></td>
                            <td>${this.formatCurrency(status.valorTotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.containers.statusEstoque.innerHTML = html;
    }

    /**
     * Cria mensagem de estado vazio
     */
    createEmptyMessage(message) {
        return `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Mostra estado vazio para todas as visualizações
     */
    showEmptyState() {
        Object.values(this.containers).forEach(container => {
            if (container) {
                container.innerHTML = this.createEmptyMessage('Sem dados disponíveis');
            }
        });
    }

    /**
     * Gera badge HTML para status de ruptura
     */
    getRupturaBadge(ruptura) {
        const badges = {
            'RUPTURA LOJA': '<span class="badge badge-warning">RUPTURA LOJA</span>',
            'RUPTURA GERAL': '<span class="badge badge-danger">RUPTURA GERAL</span>',
            'POSSIVEL RUPTURA': '<span class="badge badge-info">POSSÍVEL RUPTURA</span>',
            'SEM RUPTURA': '<span class="badge badge-success">SEM RUPTURA</span>'
        };
        
        return badges[ruptura] || `<span class="badge">${ruptura}</span>`;
    }

    /**
     * Gera badge HTML para status de estoque
     */
    getStatusEstoqueBadge(status) {
        const badges = {
            'SEM ESTQ LJ / SEM ESTQ CDBR': '<span class="badge badge-danger">SEM ESTOQUE</span>',
            'AMBOS COM ESTOQUE': '<span class="badge badge-success">AMBOS COM ESTOQUE</span>',
            'ESTQ LJ DISPONÍVEL': '<span class="badge badge-primary">ESTQ LJ DISPONÍVEL</span>',
            'ESTQ CDBR DISPONÍVEL': '<span class="badge badge-info">ESTQ CDBR DISPONÍVEL</span>'
        };
        
        return badges[status] || `<span class="badge">${status}</span>`;
    }

    /**
     * Retorna cor CSS para status de ruptura
     */
    getRupturaColor(ruptura) {
        const colors = {
            'RUPTURA LOJA': 'warning',
            'RUPTURA GERAL': 'danger',
            'POSSIVEL RUPTURA': 'info',
            'SEM RUPTURA': 'success'
        };
        
        return colors[ruptura] || 'default';
    }

    /**
     * Retorna badge para status de estoque na tabela
     */
    getStatusBadge(status) {
        const badges = {
            'SEM ESTQ LJ / SEM ESTQ CDBR': '<span class="badge badge-danger">SEM ESTOQUE</span>',
            'AMBOS COM ESTOQUE': '<span class="badge badge-success">COM ESTOQUE</span>',
            'ESTQ LJ DISPONÍVEL': '<span class="badge badge-primary">LOJA</span>',
            'ESTQ CDBR DISPONÍVEL': '<span class="badge badge-info">CDBR</span>'
        };
        
        return badges[status] || `<span class="badge">${status}</span>`;
    }

    /**
     * Formata número para exibição
     */
    formatNumber(value) {
        if (value === null || value === undefined) return '0';
        return Number(value).toLocaleString('pt-BR');
    }

    /**
     * Formata valor monetário
     */
    formatCurrency(value) {
        if (value === null || value === undefined) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }

    /**
     * Trunca string para limite especificado
     */
    truncateString(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    /**
     * Exporta dados das mini tabelas (opcional)
     */
    exportMiniTables() {
        console.log('Exportação de mini tabelas não implementada');
    }
}

// Exportar para uso global
window.ChartManager = ChartManager;