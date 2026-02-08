/**
 * @param {Object} params
 * @param {import("sequelize").Sequelize} params.database - Sequelize instance holder (with .sequelize)
 * @param {import("sequelize").Model} params.AwardShipments - AwardShipments model
 * @param {import("sequelize").Model} params.Commissions - Commissions model
 * @param {Array<{key: string, value: number}>} params.AWARD_THRESHOLDS - Threshold configuration
 * @param {number|string} params.id_user - Producer id
 * @param {string|Date} params.paid_at - Fallback date for achievement
 * @param {import("sequelize").Transaction} params.transaction - Sequelize transaction
 */
export async function processAwardShipments({
  database,
  AwardShipments,
  Commissions,
  AWARD_THRESHOLDS,
  id_user,
  paid_at,
  transaction: t,
}) {
  try {
    const response = await Commissions.sequelize.query(
      'select sum(c.amount) as total from commissions c join sales_items si on si.id = c.id_sale_item where si.id_status in (2) and c.id_user = :id_user',
      {
        plain: true,
        replacements: {
          id_user,
        },
      },
    );
    const totalRevenue = response ?  Number(response.total) : 0;
    console.log("[usersRevenue] Total de comissões calculado", {
      id_user,
      totalRevenue,
    });

    const achievedMilestones = AWARD_THRESHOLDS.filter(
      (thr) => totalRevenue >= thr.value
    ).map((thr) => thr.key);
    console.log("[usersRevenue] Marcos alcançados (pelo total)", {
      id_user,
      achievedMilestones,
    });

    const created = [];

    if (achievedMilestones.length > 0) {
      const existing = await AwardShipments.findAll({
        attributes: ["milestone"],
        where: { producer_id: id_user },
        transaction: t,
        lock: true,
      });
      const existingMilestones = existing.map((row) => row.milestone);
      const milestonesToCreate = achievedMilestones.filter(
        (m) => !existingMilestones.includes(m)
      );
      if (milestonesToCreate.length === 0) {
        console.log(
          "[usersRevenue] Nenhum novo marco para cadastrar. Já existe(m) premiação(ões) para os marcos alcançados",
          { id_user, existingMilestones }
        );
        return created;
      }
      console.log("[usersRevenue] Cadastrando marcos ausentes para usuário", {
        id_user,
        existingMilestones,
        milestonesToCreate,
      });

      for (const milestone of milestonesToCreate) {
        let exactAchievedDate = paid_at;
        try {
          console.log("[usersRevenue] Calculando data exata de conquista", {
            id_user,
            milestone,
          });
          const rows = await database.sequelize.query(
            `SELECT c.amount, c.created_at, c.id FROM commissions c join sales_items si on si.id = c.id_sale_item where si.id_status in (2) and c.id_user = :id_user ORDER BY c.created_at ASC, c.id ASC`,
            {
              type: database.sequelize.QueryTypes.SELECT,
              raw: true,
              replacements: { id_user },
              transaction: t,
            }
          );
          const thresholdValue =
            AWARD_THRESHOLDS.find((x) => x.key === milestone)?.value || 0;
          let acc = 0;
          for (const row of rows) {
            acc += Number(row.amount || 0);
            if (acc >= thresholdValue) {
              exactAchievedDate = row.created_at || paid_at;
              break;
            }
          }
          console.log("[usersRevenue] Data exata de conquista calculada", {
            id_user,
            milestone,
            thresholdValue,
            exactAchievedDate,
          });
        } catch (calcErr) {
          console.log(
            "[usersRevenue] Erro ao calcular data exata de conquista",
            { id_user, milestone, error: String(calcErr) }
          );
        }

        const createdRow = await AwardShipments.create(
          {
            producer_id: id_user,
            milestone,
            status: "pending",
            achieved_date: exactAchievedDate,
          },
          { transaction: t, lock: true }
        );
        created.push(createdRow);
        console.log("[usersRevenue] AwardShipments criado", {
          id_user,
          milestone,
          achieved_date: exactAchievedDate,
          status: "pending",
        });

        //---------------------------------------------------
        // Disparo de email (desabilitado em desenvolvimento)
        //---------------------------------------------------
        // try {
        //   const [producer] = await database.sequelize.query(
        //     `SELECT full_name, email FROM users WHERE id = :id LIMIT 1`,
        //     {
        //       type: database.sequelize.QueryTypes.SELECT,
        //       raw: true,
        //       replacements: { id: id_user },
        //       transaction: t,
        //     }
        //   );
        //   if (producer) {
        //     const template = AwardAchieved({
        //       full_name: producer.full_name,
        //       milestone,
        //     });
        //     await sendMail({
        //       subject: `🎉 Parabéns! Você alcançou R$ ${milestone} em vendas!`,
        //       to: [{ Email: producer.email, Name: producer.full_name }],
        //       variables: template,
        //     });
        //   }
        // } catch (emailErr) {
        //   console.log("[EMAIL_DISABLED] Error preparing award email", emailErr);
        // }
      }
    }

    return created;
  } catch (awardError) {
    console.error(awardError);
    throw awardError;
  }
}
