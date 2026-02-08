// const cron = require('node-cron');
// const { QueryTypes } = require('sequelize');
// const Database = require('../database/models');
// const AwardShipmentsRepository = require('../repositories/sequelize/AwardShipmentsRepository');
// const AwardAchieved = require('../services/email/awards/AwardAchieved');

// CRON DESABILITADO - Teste pausado
/*
cron.schedule('10 * * * * *', async () => {
  console.info('[updateRewardsTable] CRON RODANDO - Testando premiação 500K');

  try {
    const testProducerUuid = '4cebe240-9bc0-46ca-b7e8-99bf7888e13f';

    // Busca o produtor pelo UUID
    const [producer] = await Database.sequelize.query(
      `SELECT id, full_name, email FROM users WHERE uuid = :uuid LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { uuid: testProducerUuid },
      },
    );

    if (!producer) {
      console.log('Produtor não encontrado com UUID:', testProducerUuid);
      return;
    }

    console.log('Produtor encontrado:', producer.full_name, producer.email);

    // Verifica se já existe premiação de 500K
    const existing = await AwardShipmentsRepository.findByProducerAndMilestone(
      producer.id,
      '500K',
    );

    if (existing) {
      console.log('Premiação de 500K já existe para este produtor');
      return;
    }

    // Cria a premiação de 500K
    const awardData = await AwardShipmentsRepository.create({
      producer_id: producer.id,
      milestone: '500K',
      achieved_date: new Date(),
      status: 'pending',
    });

    console.log('Premiação de 500K criada:', awardData.id);

    // Envia email de parabéns (TESTE - email fixo)
    const emailService = new AwardAchieved({
      email: 'coderodrigo07@gmail.com', // Email fixo para teste
      full_name: producer.full_name,
      milestone: '500K',
      revenue_total: 2000000, // 2M como mencionado
    });

    await emailService.send();
    console.log(
      'Email de parabéns enviado para: coderodrigo07@gmail.com (TESTE)',
    );
  } catch (error) {
    console.error('Erro no cron de teste:', error);
  }
});
*/
