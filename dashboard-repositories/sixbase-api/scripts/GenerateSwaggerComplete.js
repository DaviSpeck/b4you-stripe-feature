const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

/**
 * Script completo para gerar documentação Swagger
 * 1. Gera paths.yaml automaticamente dos módulos
 * 2. Gera bundle.json com resolução completa
 */
function generateSwaggerComplete() {
    console.log('Iniciando geração completa da documentação Swagger...');

    try {
        // Passo 1: Gerar paths.yaml automaticamente
        console.log('\nPasso 1: Gerando paths.yaml...');
        const { generatePaths } = require('./GeneratePaths');
        generatePaths();

        // Passo 2: Gerar bundle com resolução completa
        console.log('\nPasso 2: Gerando bundle com resolução completa...');
        const docsDir = path.join(__dirname, '../docs');
        const openapiPath = path.join(docsDir, 'openapi.yaml');
        const bundleJsonPath = path.join(docsDir, 'bundle.json');
        const bundleYamlPath = path.join(docsDir, 'bundle.yaml');

        // Usar swagger-cli para resolver referências
        try {
            execSync(`npx @apidevtools/swagger-cli bundle "docs/openapi.yaml" -o "docs/bundle.json" -t json -r`, {
                stdio: 'pipe',
                cwd: path.join(__dirname, '..')
            });
            console.log('Bundle JSON gerado com resolução completa');
        } catch (error) {
            console.log('Erro ao gerar bundle JSON, tentando sem resolução...');
            try {
                execSync(`npx @apidevtools/swagger-cli bundle "docs/openapi.yaml" -o "docs/bundle.json" -t json`, {
                    stdio: 'pipe',
                    cwd: path.join(__dirname, '..')
                });
                console.log('Bundle JSON gerado sem resolução');
            } catch (error2) {
                console.log('Erro ao gerar bundle JSON:', error2.message);
                throw error2;
            }
        }

        // Gerar também o bundle YAML
        try {
            execSync(`npx @apidevtools/swagger-cli bundle "docs/openapi.yaml" -o "docs/bundle.yaml" -t yaml -r`, {
                stdio: 'pipe',
                cwd: path.join(__dirname, '..')
            });
            console.log('Bundle YAML gerado com resolução completa');
        } catch (error) {
            console.log('Erro ao gerar bundle YAML, tentando sem resolução...');
            try {
                execSync(`npx @apidevtools/swagger-cli bundle "docs/openapi.yaml" -o "docs/bundle.yaml" -t yaml`, {
                    stdio: 'pipe',
                    cwd: path.join(__dirname, '..')
                });
                console.log('Bundle YAML gerado sem resolução');
            } catch (error2) {
                console.log('Erro ao gerar bundle YAML:', error2.message);
                // Não falhar se YAML não funcionar
            }
        }

        // Passo 3: Estatísticas finais
        console.log('\nPasso 3: Estatísticas finais...');

        if (fs.existsSync(bundleJsonPath)) {
            const bundleContent = JSON.parse(fs.readFileSync(bundleJsonPath, 'utf8'));
            const totalPaths = Object.keys(bundleContent.paths || {}).length;
            const totalSchemas = Object.keys(bundleContent.components?.schemas || {}).length;
            const totalTags = bundleContent.tags?.length || 0;

            console.log(`  Rotas totais: ${totalPaths}`);
            console.log(`  Schemas totais: ${totalSchemas}`);
            console.log(`  Tags totais: ${totalTags}`);

            // Contar exemplos
            const bundleText = fs.readFileSync(bundleJsonPath, 'utf8');
            const exampleCount = (bundleText.match(/"example":/g) || []).length;
            console.log(`  Exemplos encontrados: ${exampleCount}`);
        }

        console.log('\nDocumentação Swagger gerada com sucesso!');
        console.log('Acesse: http://localhost:5501/docs');
        console.log('Para regenerar: yarn swagger:generate');

    } catch (error) {
        console.error('Erro na geração completa:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    generateSwaggerComplete();
}

module.exports = { generateSwaggerComplete };
