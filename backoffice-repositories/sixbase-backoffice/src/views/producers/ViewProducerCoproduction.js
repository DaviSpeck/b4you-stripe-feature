import React from 'react';
import {
	Badge,
	Card,
	CardBody,
	Modal,
	ModalBody,
	ModalHeader,
} from 'reactstrap';

export default function ViewProducerCoproduction({ show, toggle, data }) {
	return (
		<Modal id='modalViewStudentProducts' isOpen={show} toggle={toggle} centered>
			<ModalHeader toggle={toggle}>
				Coproduções de {data && data.full_name}
			</ModalHeader>
			<ModalBody>
				{show &&
					data &&
					data.coproductions.map((item) => {
						return (
							<Card key={item.uuid}>
								<CardBody>
									<div className='view-ss-container'>
										<div className='view-ss-item'>
											<span>Produto</span>
											<span>{item.product.name}</span>
										</div>
										<div className='view-ss-item mt-1'>
											<span>UUID</span>
											<span>{item.product.uuid}</span>
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
				{show && data && data.coproductions.length === 0 && (
					<div className='pt-1 pb-1'>Sem coproduções para exibir.</div>
				)}
			</ModalBody>
		</Modal>
	);
}
