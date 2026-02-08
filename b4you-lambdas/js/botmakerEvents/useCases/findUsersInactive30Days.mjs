import { QueryTypes } from "sequelize";

const ONE_DAY_MS = 86400000;
const DEFAULT_INACTIVE_DAYS = 30;
const PRODUCER_ROLE = 1;

export function calculateInactiveDays(lastPaidAt, referenceDate = new Date()) {
  if (!lastPaidAt) return DEFAULT_INACTIVE_DAYS;
  const diff = referenceDate - new Date(lastPaidAt);
  return Math.floor(diff / ONE_DAY_MS);
}

export function getInactiveCutoffDate(referenceDate = new Date(), days = DEFAULT_INACTIVE_DAYS) {
  const cutoff = new Date(referenceDate);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export async function findUsersInactive30Days(sequelize, models, options = {}) {
  const {
    referenceDate = new Date(),
    days = DEFAULT_INACTIVE_DAYS,
    userId,
  } = options;

  const cutoffDate = getInactiveCutoffDate(referenceDate, days);

  const usersTable = models.Users.getTableName();
  const commissionsTable = models.Commissions.getTableName();

  console.log("\n==============================");
  console.log("🔍 DEBUG: findUsersInactive30Days");
  console.log("==============================");
  console.log("➡ Reference date:", referenceDate);
  console.log("➡ Cutoff date:", cutoffDate);
  console.log("➡ userId:", userId ?? "(none)");
  console.log("------------------------------");

  // 🟢 Se userId estiver presente → NÃO aplicar filtro de data
  const havingClause = userId
    ? "1 = 1" // sempre retorna o usuário
    : `
      lastPaidAt IS NOT NULL
      AND DATE(lastPaidAt) = DATE(:cutoffDate)
    `;

  const rows = await sequelize.query(
    `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.email,
      u.whatsapp,
      MAX(c.created_at) AS lastPaidAt
    FROM ${usersTable} u
    LEFT JOIN ${commissionsTable} c
      ON c.id_user = u.id
      AND c.id_role = ${PRODUCER_ROLE}
    WHERE 
      u.active = 1
      AND u.whatsapp IS NOT NULL
      AND u.whatsapp <> ''
      ${userId ? "AND u.id = :userId" : ""}
    GROUP BY 
      u.id, u.first_name, u.last_name, u.full_name, u.email, u.whatsapp
    HAVING ${havingClause}
    `,
    {
      replacements: {
        cutoffDate,
        ...(userId ? { userId } : {}),
      },
      type: QueryTypes.SELECT,
    }
  );

  console.log("📊 SQL retornou registros:", rows.length);

  return rows.map((user) => ({
    id: user.id,
    name: user.full_name || `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.whatsapp,
    inactiveDays: calculateInactiveDays(user.lastPaidAt, referenceDate),
    lastSaleAt: user.lastPaidAt,
  }));
}