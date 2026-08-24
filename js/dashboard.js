class DashboardManager {
    constructor() {
        this.elements = {
            dashboardCards: document.getElementById('dashboardCards'),
            topProdutosTable: document.getElementById('topProdutosTable'),
            categoriasTable: document.getElementById('categoriasTable'),
            rupturasTable: document.getElementById('rupturasTable'),
            statusEstoqueTable: document.getElementById('statusEstoqueTable')
        };
    }

    updateDashboard(data) {
        this.updateCards(data);
        this.updateMiniTables(data);
    }

    updateCards(data) {
        // Agrupar por SKU para contagem distinta
        const skuMap = new Map();
        
        data.forEach(item => {
            const codigoProduto = item.codigoProduto;
            
            if (!skuMap.has(codigoProduto)) {
                skuMap.set(codigoProduto, {
                    codigoProduto: codigoProduto,
                    ruptura: item.ruptura,
                    statusEstoque: item.statusEstoque,
                    quantidadeTotal: (item.quantidadeDisponivel || 0) + (item.quantidadeDisponivelCDBR || 0),
                    temVenda: item.temVenda
                });
            } else {
                const existing = skuMap.get(codigoProduto);
                existing.quantidadeTotal += (item.quantidadeDisponivel || 0) + (item.quantidadeDisponivelCDBR || 0);
                
                const rupturePriority = {
                    'RUPTURA GERAL': 4,
                    'RUPTURA LOJA': 3,
                    'POSSIVEL RUPTURA': 2,
                    'SEM RUPTURA': 1
                };
                
                if (rupturePriority[item.ruptura] > rupturePriority[existing.ruptura]) {
                    existing.ruptura = item.ruptura;
                }
                
                if (item.temVenda) {
                    existing.temVenda = true;
                }
            }
        });
        
        const totalSKUs = skuMap.size;
        
        const rupturas = {
            'SEM RUPTURA': 0,
            'POSSIVEL RUPTURA': 0,
            'RUPTURA LOJA': 0,
            'RUPTURA GERAL': 0
        };
        
        skuMap.forEach(sku => {
            if (rupturas[sku.ruptura] !== undefined) {
                rupturas[sku.ruptura]++;
            }
        });
        
        const totalSemRuptura = rupturas['SEM RUPTURA'];
        const totalPossivelRuptura = rupturas['POSSIVEL RUPTURA'];
        const totalRupturaLoja = rupturas['RUPTURA LOJA'];
        const totalRupturaGeral = rupturas['RUPTURA GERAL'];
        const totalRupturas = totalRupturaLoja + totalRupturaGeral;

        const cards = [
            { 
                title: 'SKUs', 
                value: totalSKUs, 
                color: '#2563eb',
                icon: '📦'
            },
            { 
                title: 'Sem Ruptura', 
                value: totalSemRuptura, 
                color: '#10b981',
                icon: '✅'
            },
            { 
                title: 'Possível Ruptura', 
                value: totalPossivelRuptura, 
                color: '#f59e0b',
                icon: '⚠️'
            },
            { 
                title: 'Ruptura Geral', 
                value: totalRupturas, 
                color: '#ef4444',
                icon: '🚨'
            }
        ];

        this.elements.dashboardCards.innerHTML = cards.map(card => `
            <div class="card fade-in">
                <div class="card-icon" style="background: ${card.color}20; color: ${card.color}">
                    ${card.icon}
                </div>
                <div class="card-content">
                    <h3>${card.title}</h3>
                    <p style="color: ${card.color}">${card.value.toLocaleString('pt-BR')}</p>
                </div>
            </div>
        `).join('');
    }

    updateMiniTables(data) {
        this.renderTopProdutos(data);
        this.renderRupturaPorLoja(data);
        this.renderRupturas(data);
        this.renderStatusEstoque(data);
    }

    renderTopProdutos(data) {
        if (!this.elements.topProdutosTable) return;
        
        // Filtrar apenas produtos com RUPTURA GERAL
        const rupturaGeral = data.filter(item => item.ruptura === 'RUPTURA GERAL');
        
        // Agrupar por SKU
        const skuMap = new Map();
        rupturaGeral.forEach(item => {
            const key = item.codigoProduto;
            if (!skuMap.has(key)) {
                skuMap.set(key, {
                    codigoProduto: item.codigoProduto,
                    produto: item.produto,
                    mediaVendaMes: item.mediaVendaMes || 0
                });
            } else {
                const existing = skuMap.get(key);
                existing.mediaVendaMes += item.mediaVendaMes || 0;
            }
        });
        
        const topProdutos = Array.from(skuMap.values())
            .sort((a, b) => b.mediaVendaMes - a.mediaVendaMes)
            .slice(0, 10);
        
        if (topProdutos.length === 0) {
            this.elements.topProdutosTable.innerHTML = this.createEmptyMessage('Nenhum produto em ruptura geral');
            return;
        }
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Produto</th>
                        <th>Média Vda Mês</th>
                    </tr>
                </thead>
                <tbody>
                    ${topProdutos.map((item, index) => `
                        <tr>
                            <td><strong>${index + 1}</strong></td>
                            <td title="${item.produto}">${this.truncateString(item.produto, 30)}</td>
                            <td><strong>${this.formatNumber(item.mediaVendaMes)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.elements.topProdutosTable.innerHTML = html;
    }

    renderRupturaPorLoja(data) {
        if (!this.elements.categoriasTable) return;
        
        // Agrupar por empresa/loja
        const lojaMap = new Map();
        
        data.forEach(item => {
            const loja = item.empresa || 'Sem Loja';
            
            if (!lojaMap.has(loja)) {
                lojaMap.set(loja, {
                    nome: loja,
                    rupturaGeral: 0,
                    possivelRuptura: 0,
                    rupturaLoja: 0,
                    semRuptura: 0
                });
            }
            
            const lojaData = lojaMap.get(loja);
            
            if (item.ruptura === 'RUPTURA GERAL') {
                lojaData.rupturaGeral++;
            } else if (item.ruptura === 'POSSIVEL RUPTURA') {
                lojaData.possivelRuptura++;
            } else if (item.ruptura === 'RUPTURA LOJA') {
                lojaData.rupturaLoja++;
            } else {
                lojaData.semRuptura++;
            }
        });
        
        const lojas = Array.from(lojaMap.values())
            .sort((a, b) => b.rupturaGeral - a.rupturaGeral)
            .slice(0, 15);
        
        if (lojas.length === 0) {
            this.elements.categoriasTable.innerHTML = this.createEmptyMessage('Nenhuma loja encontrada');
            return;
        }
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>Loja</th>
                        <th>Ruptura Geral</th>
                        <th>Possível Ruptura</th>
                        <th>Ruptura Loja</th>
                    </tr>
                </thead>
                <tbody>
                    ${lojas.map(loja => `
                        <tr>
                            <td title="${loja.nome}">${this.truncateString(loja.nome, 20)}</td>
                            <td><span class="badge badge-danger">${loja.rupturaGeral}</span></td>
                            <td><span class="badge badge-warning">${loja.possivelRuptura}</span></td>
                            <td><span class="badge badge-info">${loja.rupturaLoja}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.elements.categoriasTable.innerHTML = html;
    }

    renderRupturas(data) {
        if (!this.elements.rupturasTable) return;
        
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
            this.elements.rupturasTable.innerHTML = this.createEmptyMessage('Nenhuma ruptura encontrada');
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
        
        this.elements.rupturasTable.innerHTML = html;
    }

    renderStatusEstoque(data) {
        if (!this.elements.statusEstoqueTable) return;
        
        const statusMap = new Map();
        data.forEach(item => {
            const status = item.statusEstoque || 'SEM ESTOQUE';
            if (!statusMap.has(status)) {
                statusMap.set(status, {
                    nome: status,
                    quantidade: 0
                });
            }
            
            statusMap.get(status).quantidade++;
        });
        
        const statusList = Array.from(statusMap.values())
            .sort((a, b) => b.quantidade - a.quantidade);
        
        if (statusList.length === 0) {
            this.elements.statusEstoqueTable.innerHTML = this.createEmptyMessage('Nenhum status encontrado');
            return;
        }
        
        const html = `
            <table class="mini-table">
                <thead>
                    <tr>
                        <th>Status Estoque</th>
                        <th>Qtd Produtos</th>
                    </tr>
                </thead>
                <tbody>
                    ${statusList.map(status => `
                        <tr>
                            <td>${this.getStatusEstoqueBadge(status.nome)}</td>
                            <td><strong>${status.quantidade}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        this.elements.statusEstoqueTable.innerHTML = html;
    }

    createEmptyMessage(message) {
        return `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
    }

    getRupturaBadge(ruptura) {
        const badges = {
            'RUPTURA LOJA': '<span class="badge badge-warning">RUPTURA LOJA</span>',
            'RUPTURA GERAL': '<span class="badge badge-danger">RUPTURA GERAL</span>',
            'POSSIVEL RUPTURA': '<span class="badge badge-info">POSSÍVEL RUPTURA</span>',
            'SEM RUPTURA': '<span class="badge badge-success">SEM RUPTURA</span>'
        };
        
        return badges[ruptura] || `<span class="badge">${ruptura}</span>`;
    }

    getStatusEstoqueBadge(status) {
        const badges = {
            'COM ESTOQUE LOJA / COM ESTOQUE CDBR': '<span class="badge badge-success">COM ESTOQUE LJ / COM ESTOQUE CDBR</span>',
            'SEM ESTOQUE LOJA / SEM ESTOQUE CDBR': '<span class="badge badge-danger">SEM ESTOQUE LJ / SEM ESTOQUE CDBR</span>',
            'COM ESTOQUE LOJA / SEM ESTOQUE CDBR': '<span class="badge badge-primary">COM ESTOQUE LJ / SEM ESTOQUE CDBR</span>',
            'SEM ESTOQUE LOJA / COM ESTOQUE CDBR': '<span class="badge badge-info">SEM ESTOQUE LJ / COM ESTOQUE CDBR</span>'
        };
        
        return badges[status] || `<span class="badge">${status}</span>`;
    }

    getRupturaColor(ruptura) {
        const colors = {
            'RUPTURA LOJA': 'warning',
            'RUPTURA GERAL': 'danger',
            'POSSIVEL RUPTURA': 'info',
            'SEM RUPTURA': 'success'
        };
        
        return colors[ruptura] || 'default';
    }

    formatNumber(value) {
        if (value === null || value === undefined) return '0';
        return Number(value).toLocaleString('pt-BR');
    }

    formatCurrency(value) {
        if (value === null || value === undefined) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }

    truncateString(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }
}

window.DashboardManager = DashboardManager;
