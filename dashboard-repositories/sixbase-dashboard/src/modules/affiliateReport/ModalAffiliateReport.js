
const ModalAffiliateReport = ({ activeAffiliate }) => {
    const productsReport = [
        {
            name: 'Nome do Produto',
            commission: 3,
            amountSales: 432,
            numberSales:12,
        },
        {
            name: 'Nome do Produto 2',
            commission: 3,
            amountSales: 432,
            numberSales:12,
        },
    ];
    return (
    <>
        <p className='primary font-weight-bold'>Resumo</p>
        <table className='table'>
            <tbody>
                <tr>
                    <td>Nome</td>
                    <td>{activeAffiliate.full_name || '-'}</td>
                </tr>
                <tr>
                    <td>E-mail</td>
                    <td>{activeAffiliate.email || '-'}</td>
                </tr>
                <tr>
                    <td>Número de Vendas</td>
                    <td>{activeAffiliate.email || '-'}</td>
                </tr>
                <tr>
                    <td>Total em vendas</td>
                    <td>{activeAffiliate.email || '-'}</td>
                </tr>
            </tbody> 
       </table>
       { productsReport.map((item) => (
        <>
        <p className='primary font-weight-bold'>{item.name}</p>
        <table className='table'>
            <tbody>
                <tr>
                    <td>Comissão</td>
                    <td>{item.commission}</td>
                </tr>
                <tr>
                    <td>Número de Vendas</td>
                    <td>{item.numberSales}</td>
                </tr>
                <tr>
                    <td>Total de Vendas</td>
                    <td>{item.amountSales}</td>
                </tr>
            </tbody>
        </table>
        </>
))}
      </>);
};
export default ModalAffiliateReport;