class DataProcessor {
    constructor() {
        this.processedData = [];
        this.rawData = {
            estoqueLoja: [],
            estoqueCDBR: [],
            venda26: [],
            baseCadastro: []
        };
    }

    async loadExcelFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Falha ao carregar ${filename} - Status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            return workbook;
        } catch (error) {
            console.error(`Erro ao carregar ${filename}:`, error);
            throw error;
        }
    }

    sheetToJson(worksheet) {
        return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    }

    findSheet(workbook, possibleNames) {
        const sheetNames = workbook.SheetNames;
        
        for (const name of possibleNames) {
            if (sheetNames.includes(name)) {
                return workbook.Sheets[name];
            }
        }
        
        for (const sheetName of sheetNames) {
            const normalizedName = sheetName.toUpperCase().replace(/\s+/g, ' ');
            for (const name of possibleNames) {
                const normalizedSearch = name.toUpperCase().replace(/\s+/g, ' ');
                if (normalizedName.includes(normalizedSearch)) {
                    return workbook.Sheets[sheetName];
                }
            }
        }
        
        if (sheetNames.length > 0) {
            return workbook.Sheets[sheetNames[0]];
        }
        
        return null;
    }

    normalizeColumnName(name) {
        return name.trim().replace(/\s+/g, ' ');
    }

    getValueByColumn(obj, possibleNames) {
        if (!obj) return '';
        
        for (const name of possibleNames) {
            if (obj[name] !== undefined && obj[name] !== null) {
                return obj[name];
            }
            
            const normalizedName = this.normalizeColumnName(name);
            for (const key of Object.keys(obj)) {
                if (this.normalizeColumnName(key) === normalizedName) {
                    return obj[key];
                }
            }
        }
        return '';
    }

    async findVendaFile() {
        const possibleNames = CONFIG.fileNames.venda;
        
        for (const fileName of possibleNames) {
            try {
                const response = await fetch(fileName, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`Arquivo de vendas encontrado: ${fileName}`);
                    return fileName;
                }
            } catch (error) {
                // Continua tentando
            }
        }
        
        throw new Error('Arquivo de vendas não encontrado');
    }

    async loadAllData() {
        try {
            console.log('=== INICIANDO CARREGAMENTO DOS DADOS ===');
            
            // 1. Carregar ESTOQUE
            const estoqueWB = await this.loadExcelFile(CONFIG.fileNames.estoque);
            
            const estoqueLojaSheet = this.findSheet(estoqueWB, CONFIG.sheetNames.estoqueLoja);
            if (!estoqueLojaSheet) {
                throw new Error('Não foi possível encontrar a aba de estoque da loja');
            }
            this.rawData.estoqueLoja = this.sheetToJson(estoqueLojaSheet);
            console.log(`→ ${this.rawData.estoqueLoja.length} registros de estoque loja carregados`);

            const estoqueCDBRSheet = this.findSheet(estoqueWB, CONFIG.sheetNames.estoqueCDBR);
            if (!estoqueCDBRSheet) {
                throw new Error('Não foi possível encontrar a aba ESTOQUE CDBR');
            }
            this.rawData.estoqueCDBR = this.sheetToJson(estoqueCDBRSheet);
            console.log(`→ ${this.rawData.estoqueCDBR.length} registros de estoque CDBR carregados`);

            // 2. Carregar VENDAS
            const vendaFileName = await this.findVendaFile();
            const vendaWB = await this.loadExcelFile(vendaFileName);
            
            const vendaSheet = this.findSheet(vendaWB, CONFIG.sheetNames.venda);
            if (!vendaSheet) {
                throw new Error('Não foi possível encontrar a aba de vendas');
            }
            this.rawData.venda26 = this.sheetToJson(vendaSheet);
            console.log(`→ ${this.rawData.venda26.length} registros de vendas carregados`);

            // 3. Carregar CADASTRO
            const baseCadastroWB = await this.loadExcelFile(CONFIG.fileNames.cadastro);
            
            const baseCadastroSheet = this.findSheet(baseCadastroWB, CONFIG.sheetNames.cadastro);
            if (!baseCadastroSheet) {
                throw new Error('Não foi possível encontrar a aba ARVORE');
            }
            this.rawData.baseCadastro = this.sheetToJson(baseCadastroSheet);
            console.log(`→ ${this.rawData.baseCadastro.length} registros de cadastro carregados`);

            console.log('=== TODOS OS DADOS CARREGADOS COM SUCESSO ===');
            return true;
        } catch (error) {
            console.error('=== ERRO NO CARREGAMENTO ===', error);
            throw error;
        }
    }

    calculateRuptura(estqLj, estqCdbr, mediaVendaMes) {
        if (estqLj <= 0 && estqCdbr > 0 && mediaVendaMes > 0) {
            return 'RUPTURA LOJA';
        } else if (estqLj <= 0 && estqCdbr <= 0 && mediaVendaMes > 0) {
            return 'RUPTURA GERAL';
        } else if ((estqLj > 0 && estqCdbr > 0 && mediaVendaMes <= 0) || 
                   (estqLj > 0 && estqCdbr <= 0 && mediaVendaMes <= 0)) {
            return 'POSSIVEL RUPTURA';
        } else {
            return 'SEM RUPTURA';
        }
    }

    calculateStatusEstoque(estqLj, estqCdbr) {
        if (estqLj > 0 && estqCdbr > 0) {
            return 'COM ESTOQUE LOJA / COM ESTOQUE CDBR';
        } else if (estqLj <= 0 && estqCdbr <= 0) {
            return 'SEM ESTOQUE LOJA / SEM ESTOQUE CDBR';
        } else if (estqLj > 0 && estqCdbr <= 0) {
            return 'COM ESTOQUE LOJA / SEM ESTOQUE CDBR';
        } else {
            return 'SEM ESTOQUE LOJA / COM ESTOQUE CDBR';
        }
    }

    processData() {
        console.log('=== PROCESSANDO DADOS ===');
        
        // Criar mapas para busca rápida
        const cdbrMap = new Map();
        this.rawData.estoqueCDBR.forEach(item => {
            const key = this.getValueByColumn(item, CONFIG.columns.codigoProduto);
            if (key) {
                cdbrMap.set(String(key).trim(), item);
            }
        });
        console.log(`Mapa CDBR criado com ${cdbrMap.size} itens`);

        const cadastroMap = new Map();
        this.rawData.baseCadastro.forEach(item => {
            const key = this.getValueByColumn(item, CONFIG.columns.seqProd);
            if (key) {
                cadastroMap.set(String(key).trim(), item);
            }
        });
        console.log(`Mapa Cadastro criado com ${cadastroMap.size} itens`);

        // Agrupar vendas por produto e loja
        const vendasMap = new Map();
        this.rawData.venda26.forEach(venda => {
            const codigoC5 = this.getValueByColumn(venda, CONFIG.columns.codigoC5);
            const loja = this.getValueByColumn(venda, CONFIG.columns.loja);
            
            if (codigoC5 && loja) {
                const key = `${String(codigoC5).trim()}_${String(loja).trim()}`;
                if (!vendasMap.has(key)) {
                    vendasMap.set(key, {
                        quantidades: [],
                        valores: []
                    });
                }
                const vendaData = vendasMap.get(key);
                const qtd = parseFloat(this.getValueByColumn(venda, CONFIG.columns.qtd)) || 0;
                const valorTotal = parseFloat(this.getValueByColumn(venda, CONFIG.columns.totalR)) || 0;
                
                vendaData.quantidades.push(qtd);
                vendaData.valores.push(valorTotal);
            }
        });
        console.log(`Mapa de Vendas criado com ${vendasMap.size} combinações`);

        // Processar dados
        this.processedData = [];
        
        this.rawData.estoqueLoja.forEach(item => {
            const codigoProduto = this.getValueByColumn(item, CONFIG.columns.codigoProduto);
            const empresa = this.getValueByColumn(item, CONFIG.columns.empresa);
            
            if (!codigoProduto || !empresa) return;

            const codigoNormalizado = String(codigoProduto).trim();
            const empresaNormalizada = String(empresa).trim();
            
            // Buscar no CDBR
            const cdbrItem = cdbrMap.get(codigoNormalizado) || {};
            
            // Buscar no cadastro
            const cadastroItem = cadastroMap.get(codigoNormalizado) || {};
            
            // Calcular média de vendas
            const vendaKey = `${codigoNormalizado}_${empresaNormalizada}`;
            const vendaData = vendasMap.get(vendaKey);
            
            let mediaVendaMes = 0;
            let mediaVendaMesR = 0;
            let temVenda = false;
            
            if (vendaData && vendaData.quantidades.length > 0) {
                temVenda = true;
                mediaVendaMes = vendaData.quantidades.reduce((sum, val) => sum + val, 0) / vendaData.quantidades.length;
                mediaVendaMesR = vendaData.valores.reduce((sum, val) => sum + val, 0) / vendaData.valores.length;
            }

            // Valores de estoque
            const estqLj = parseFloat(this.getValueByColumn(item, CONFIG.columns.quantidadeDisponivel)) || 0;
            const estqCdbr = parseFloat(this.getValueByColumn(cdbrItem, CONFIG.columns.quantidadeDisponivel)) || 0;

            // Calcular ruptura e status
            const ruptura = this.calculateRuptura(estqLj, estqCdbr, mediaVendaMes);
            const statusEstoque = this.calculateStatusEstoque(estqLj, estqCdbr);

            const processedItem = {
                codigoProduto: codigoNormalizado,
                produto: this.getValueByColumn(item, CONFIG.columns.produto),
                empresa: empresaNormalizada,
                quantidadeDisponivel: estqLj,
                precoVenda: parseFloat(this.getValueByColumn(item, CONFIG.columns.precoVenda)) || 0,
                qtdPendenteCompra: parseFloat(this.getValueByColumn(item, CONFIG.columns.qtdPendenteCompra)) || 0,
                qtdPendenteExpedicao: parseFloat(this.getValueByColumn(item, CONFIG.columns.qtdPendenteExpedicao)) || 0,
                mediaVendaDia: parseFloat(this.getValueByColumn(item, CONFIG.columns.mediaVendaDia)) || 0,
                diasUltimaEntrada: parseFloat(this.getValueByColumn(item, CONFIG.columns.diasUltimaEntrada)) || 0,
                diasSemVendas: parseFloat(this.getValueByColumn(item, CONFIG.columns.diasSemVendas)) || 0,
                mediaVendaMes: mediaVendaMes || 0,
                mediaVendaMesR: mediaVendaMesR || 0,
                temVenda: temVenda,
                quantidadeDisponivelCDBR: estqCdbr,
                codigoFornecedor: this.getValueByColumn(cdbrItem, CONFIG.columns.codigoFornecedor),
                custoBrutoUnitario: parseFloat(this.getValueByColumn(cdbrItem, CONFIG.columns.custoBruto)) || 0,
                comprador: this.getValueByColumn(cadastroItem, CONFIG.columns.comprador),
                categoria: this.getValueByColumn(cadastroItem, CONFIG.columns.categoria),
                grupo: this.getValueByColumn(cadastroItem, CONFIG.columns.grupo),
                subgrupo: this.getValueByColumn(cadastroItem, CONFIG.columns.subgrupo),
                subgrupo1: this.getValueByColumn(cadastroItem, CONFIG.columns.subgrupo1),
                ruptura: ruptura,
                statusEstoque: statusEstoque
            };

            this.processedData.push(processedItem);
        });

        console.log(`=== ${this.processedData.length} registros processados ===`);
        return this.processedData;
    }

    getProcessedData() {
        return this.processedData;
    }

    getUniqueValues(field) {
        const values = new Set();
        this.processedData.forEach(item => {
            if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
                values.add(item[field]);
            }
        });
        return Array.from(values).sort();
    }
}

// Exportar para uso global
window.DataProcessor = DataProcessor;