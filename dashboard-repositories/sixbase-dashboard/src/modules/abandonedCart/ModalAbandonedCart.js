import { currency, formatPhoneNumber } from "../functions";

const ModalAbandonedCart = ({ activeCart }) => {
    return (
    <>
        <p className='primary font-weight-bold'>Informações Pessoais</p>
        <table className='table'>
            <tbody>
                <tr>
                    <td>Nome</td>
                    <td>{activeCart.full_name || '-'}</td>
                </tr>
                <tr>
                    <td>E-mail</td>
                    <td>{activeCart.email || '-'}</td>
                </tr>
                <tr>
                    <td>Celular</td>
                    <td>
                        <a
                        style={{
                                    color: '#0f1b35',
                                    textDecoration: 'underline',
                                }}
                        href={`https://wa.me/+55${activeCart.whatsapp}`}
                        target='_blank'
                        rel='noreferrer'
                        >
                            {formatPhoneNumber(activeCart.whatsapp) || '-'}
                        </a>
                    </td>
                </tr>
            </tbody> 
       </table>
        <p className='primary font-weight-bold'>Endereço</p>
        <table className='table'>
            <tbody>
                <tr>
                    <td>CEP</td>
                    <td>{activeCart.address?.zipcode || '-'}</td>
                </tr>
                <tr>
                    <td>Estado</td>
                    <td>{activeCart.address?.state || '-'}</td>
                </tr>
                <tr>
                    <td>Cidade</td>
                    <td>{activeCart.address?.city || '-'}</td>
                </tr>
                <tr>
                    <td>Bairro</td>
                    <td>{activeCart.address?.neighborhood || '-'}</td>
                </tr>
                <tr>
                    <td>Rua</td>
                    <td>{activeCart.address?.street || '-'}</td>
                </tr>
                <tr>
                    <td>Número</td>
                    <td>{activeCart.address?.number || '-'}</td>
                </tr>
                <tr>
                    <td>Complemento</td>
                    <td>{activeCart.address?.complement || '-'}</td>
                </tr>
            </tbody>
        </table>
    {activeCart.coupon ?
        <><p className='primary font-weight-bold'>Cupom</p>
        <table className='table'>
            <tbody>
                <tr>
                    <td>Código</td>
                    <td>{activeCart.coupon.code || '-'}</td>
                </tr>
                <tr>
                    <td>Desconto</td>
                    <td>{currency(activeCart.coupon.discount) || '-'}</td>
                </tr>
                <tr>
                    <td>Valor final</td>
                    <td>{currency(activeCart.coupon.finalValue) || '-'}</td>
                </tr>
            </tbody> 
       </table></>
       : null}
      </>);
};
export default ModalAbandonedCart;