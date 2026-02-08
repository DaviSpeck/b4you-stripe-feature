import React from 'react';
import {
	Badge,
	Card,
	CardBody,
	Modal,
	ModalBody,
	ModalHeader,
} from 'reactstrap';

export default function ViewProducerAffiliates({ show, toggle, data }) {
	return (
		<Modal id='modalViewStudentProducts' isOpen={show} toggle={toggle} centered>
			<ModalHeader toggle={toggle}>
				Afiliação de {data && data.full_name}
			</ModalHeader>
			<ModalBody>
				{show &&
					data &&
					data.affiliates.map((item) => {
						return (
							<Card key={item.uuid}>
								<CardBody>
									<div className='view-ss-container'>
										<div className='view-ss-item'>
											<span>Produto</span>
											<span>{item.product.name}</span>
										</div>
										<div className='view-ss-item  mt-1'>
											<span>UUID</span>
											<span>{item.product.uuid}</span>
										</div>
										<hr />
										<div className='view-ss-item'>
											<span>Commisão</span>
											<span>{item.commission} %</span>
										</div>
										<hr />
										<div className='view-ss-item'>
											<span>Ativo</span>
											<Badge
												color={item.status.id === 2 ? 'success' : 'danger'}
											>
												{item.status.id === 2 ? 'Sim' : 'Não'}
											</Badge>
										</div>
									</div>
								</CardBody>
							</Card>
						);
					})}
				{show && data && data.affiliates.length === 0 && (
					<div className='pt-1 pb-1'>Sem afiliações para exibir.</div>
				)}
			</ModalBody>
		</Modal>
	);
}
