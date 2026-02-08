import React, { useState } from 'react';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	AccordionItem,
	Badge,
	Card,
	CardBody,
	Modal,
	ModalBody,
	ModalHeader,
} from 'reactstrap';
import { FormatBRL } from '@utils';

export default function ViewProducerSales({ show, toggle, data }) {
	const [open, setOpen] = useState('');

	const toggleAccordion = (id) => {
		if (open === id) {
			setOpen();
		} else {
			setOpen(id);
		}
	};
	let totalSales = 0;
	let totalCommission = 0;
	const totalSalesProductor = () => {
		data.producer.forEach((item) => {
			return (totalSales += item.report.paid.total.total_sales);
		});
		return totalSales;
	};

	const totalCommisionProductor = () => {
		data.producer.forEach((item) => {
			return (totalCommission += item.report.paid.total.total_commission);
		});
		return totalCommission;
	};

	return (
		<Modal id='modalViewStudentProducts' isOpen={show} toggle={toggle} centered>
			<ModalHeader toggle={toggle}>
				Vendas de {data && data.full_name}
			</ModalHeader>
			<ModalBody>
				{show && data && (
					<Card>
						<CardBody>
							<div className='view-ss-container'>
								<div className='view-ss-item'>
									<span>Produtor</span>
									<span>{data.full_name}</span>
								</div>
								<hr />
								<div className='view-ss-item'>
									<span>Vendas</span>
									<span>{FormatBRL(totalSalesProductor(), 0)}</span>
								</div>
								<hr />
								<div className='view-ss-item'>
									<span>Comissões</span>
									<span>{FormatBRL(totalCommisionProductor(), 0)}</span>
								</div>
							</div>
						</CardBody>
					</Card>
				)}
				{show &&
					data &&
					data.producer.map((product) => (
						<Card key={product.uuid}>
							<CardBody>
								<div className='view-ss-container'>
									<div className='view-ss-item'>
										<span>Produto</span>
										<span>{product.name}</span>
									</div>
									<hr />
									<Accordion flush open={open} toggle={toggleAccordion}>
										<AccordionItem>
											<AccordionHeader targetId={`${product.uuid}-1`}>
												Vendas
											</AccordionHeader>
											<AccordionBody accordionId={`${product.uuid}-1`}>
												<div className='view-ss-item'>
													<span>Total</span>
													<span>
														{FormatBRL(
															product.report.paid.total.total_sales,
															0,
														)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Pix</span>
													<span>
														{FormatBRL(product.report.paid.pix.total, 0)}
													</span>
												</div>
												<hr />

												<div className='view-ss-item'>
													<span>Cartão</span>
													<span>
														{FormatBRL(product.report.paid.card.total, 0)}
													</span>
												</div>
												<hr />

												<div className='view-ss-item'>
													<span>Boleto</span>
													<span>
														{FormatBRL(product.report.paid.billet.total, 0)}
													</span>
												</div>
											</AccordionBody>
										</AccordionItem>
										<AccordionItem>
											<AccordionHeader targetId={`${product.uuid}-2`}>
												Comissões
											</AccordionHeader>
											<AccordionBody accordionId={`${product.uuid}-2`}>
												<div className='view-ss-item'>
													<span>Total</span>
													<span>
														{FormatBRL(
															product.report.paid.total.total_commission,
															0,
														)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Pix</span>
													<span>
														{FormatBRL(product.report.paid.pix.commission, 0)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Cartão</span>
													<span>
														{FormatBRL(product.report.paid.card.commission, 0)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Boleto</span>
													<span>
														{FormatBRL(
															product.report.paid.billet.commission,
															0,
														)}
													</span>
												</div>
											</AccordionBody>
										</AccordionItem>
										<AccordionItem>
											<AccordionHeader targetId={`${product.uuid}-3`}>
												Reembolsos
											</AccordionHeader>
											<AccordionBody accordionId={`${product.uuid}-3`}>
												<div className='view-ss-item'>
													<span>Total</span>
													<span>
														{FormatBRL(
															product.report.refunded.total.total_sales,
															0,
														)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Pix</span>
													<span>
														{FormatBRL(product.report.refunded.pix.total, 0)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Cartão</span>
													<span>
														{FormatBRL(product.report.refunded.card.total, 0)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Boleto</span>
													<span>
														{FormatBRL(product.report.refunded.billet.total, 0)}
													</span>
												</div>
											</AccordionBody>
										</AccordionItem>
										<AccordionItem>
											<AccordionHeader targetId={`${product.uuid}-4`}>
												Aprovação de cartão
											</AccordionHeader>
											<AccordionBody accordionId={`${product.uuid}-4`}>
												<div className='view-ss-item'>
													<span>Total</span>
													<span>
														{FormatBRL(product.report.card.total_amount, 0)}
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Aprovados</span>
													<span>
														{FormatBRL(product.report.card.paid_amount, 0)}
													</span>
												</div>
												<div className='view-ss-item'>
													<span></span>
													<span className='mt-1'>
														{product.report.card.paid_percentage} %
													</span>
												</div>
												<hr />
												<div className='view-ss-item'>
													<span>Negados</span>
													<span>
														{FormatBRL(product.report.card.denied_amount, 0)}
													</span>
												</div>
												<div className='view-ss-item'>
													<span></span>
													<span className='mt-1'>
														{product.report.card.denied_percentage} %
													</span>
												</div>
											</AccordionBody>
										</AccordionItem>
										<hr />
									</Accordion>
								</div>
							</CardBody>
						</Card>
					))}
			</ModalBody>
		</Modal>
	);
}
