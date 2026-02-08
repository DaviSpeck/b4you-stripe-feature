// Página simples e pública para testes genéricos de front-end, sem depender de backend/auth
const TestPage = () => {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a',
                color: '#e5e7eb',
                fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                padding: '24px',
                textAlign: 'center',
            }}
        >
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
                Página de teste
            </h1>
            <p
                style={{
                    fontSize: '16px',
                    opacity: 0.9,
                    maxWidth: '520px',
                    marginBottom: '8px',
                }}
            >
                Esta é uma rota pública (<code>/teste</code>) criada apenas para você
                validar componentes de front-end sem precisar de backend ou
                autenticação.
            </p>
            <p style={{ fontSize: '14px', opacity: 0.7, maxWidth: '520px' }}>
                A tabela de extrato financeiro agora está disponível diretamente na aba{' '}
                <strong>Financeiro &gt; Extrato</strong>.
            </p>
        </div>
    );
};

export default TestPage;

