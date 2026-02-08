const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Script para gerar paths.yaml automaticamente
 * Combina todos os módulos em docs/modulos/ em um único arquivo paths.yaml
 */
function generatePaths() {
    console.log('Gerando paths.yaml automaticamente...');

    const docsDir = path.join(__dirname, '../docs');
    const modulosDir = path.join(docsDir, 'modulos');

    try {
        // Verificar se o diretório de módulos existe
        if (!fs.existsSync(modulosDir)) {
            console.log('Diretório modulos/ não encontrado. Criando estrutura...');
            fs.mkdirSync(modulosDir, { recursive: true });
        }

        const combinedPaths = {};
        let modulesFound = 0;

        // Função recursiva para percorrer todos os módulos
        function scanDirectory(dir, basePath = '') {
            if (!fs.existsSync(dir)) {
                console.log(`Diretório não encontrado: ${dir}`);
                return;
            }

            const items = fs.readdirSync(dir);

            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    // Recursivamente percorrer subdiretórios
                    scanDirectory(fullPath, path.join(basePath, item));
                } else if (item === 'paths.yaml') {
                    console.log(`Processando módulo: ${basePath || 'raiz'}`);

                    try {
                        let pathsContent = fs.readFileSync(fullPath, 'utf8');

                        // Corrigir referências relativas baseado no módulo
                        const modulePath = path.dirname(fullPath);
                        const relativePath = path.relative(docsDir, modulePath);

                        // Substituir referências ./schemas.yaml pelos caminhos corretos
                        pathsContent = pathsContent.replace(
                            /\.\/schemas\.yaml/g,
                            `./${relativePath}/schemas.yaml`
                        );

                        // Substituir todas as referências de components pelos caminhos corretos
                        pathsContent = pathsContent.replace(
                            /\.\.\/\.\.\/\.\.\/components/g,
                            './components'
                        );
                        pathsContent = pathsContent.replace(
                            /\.\.\/\.\.\/components/g,
                            './components'
                        );
                        pathsContent = pathsContent.replace(
                            /\.\.\/components/g,
                            './components'
                        );

                        const parsedPaths = yaml.load(pathsContent);

                        // Combinar paths (sobrescrever se houver conflitos)
                        Object.assign(combinedPaths, parsedPaths);
                        modulesFound++;

                        console.log(`  ${Object.keys(parsedPaths).length} rotas adicionadas`);
                    } catch (error) {
                        console.log(`  Erro ao processar ${fullPath}:`, error.message);
                    }
                }
            });
        }

        // Escanear todos os módulos
        scanDirectory(modulosDir);

        if (modulesFound === 0) {
            console.log('Nenhum módulo encontrado em docs/modulos/');
            return;
        }

        // Salvar paths consolidado
        const pathsYamlPath = path.join(docsDir, 'paths.yaml');
        fs.writeFileSync(
            pathsYamlPath,
            yaml.dump(combinedPaths, {
                indent: 2,
                lineWidth: 120
            })
        );

        console.log(`paths.yaml gerado: ${pathsYamlPath}`);
        console.log(`Resumo:`);
        console.log(`  Módulos processados: ${modulesFound}`);
        console.log(`  Rotas totais: ${Object.keys(combinedPaths).length}`);

        console.log('\npaths.yaml gerado automaticamente!');

    } catch (error) {
        console.error('Erro ao gerar paths.yaml:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    generatePaths();
}

module.exports = { generatePaths };
