import { QueryTypes } from 'sequelize';

function formatDateOnly(date) {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.toISOString().slice(0, 10);
}

export async function findBirthdayUsers(
  sequelize,
  models,
  referenceDate = new Date(),
  options = {}
) {
  const today = formatDateOnly(referenceDate);
  const usersTable = models.Users.getTableName();
  const { userId } = options;

  console.log("\n==============================");
  console.log("🎂 DEBUG: findBirthdayUsers");
  console.log("==============================");
  console.log("➡ referenceDate:", referenceDate);
  console.log("➡ today key:", today);
  console.log("➡ userId filter:", userId ?? "(none)");
  console.log("------------------------------");

  // 🟢 Caso userId tenha sido informado → ignorar filtro de aniversário
  const dateFilter = userId
    ? "1 = 1"
    : "DATE_FORMAT(u.birth_date, '%m-%d') = DATE_FORMAT(:today, '%m-%d')";

  const rows = await sequelize.query(
    `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.full_name,
      u.email,
      u.whatsapp,
      u.birth_date
    FROM ${usersTable} u
    WHERE 
      u.active = TRUE
      AND u.whatsapp IS NOT NULL
      AND u.whatsapp <> ''
      AND ${dateFilter}
      ${userId ? "AND u.id = :userId" : ""}
    `,
    {
      replacements: { today, ...(userId ? { userId } : {}) },
      type: QueryTypes.SELECT,
    }
  );

  console.log("📊 Birthday users encontrados:", rows.length);
  if (rows[0]) console.log("🧪 Exemplo:", rows[0]);

  console.log("🔚 Fim do debug de birthday users\n");

  return rows.map((user) => ({
    id: user.id,
    name: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    phone: user.whatsapp,
    birthDate: user.birth_date,
  }));
}

export { formatDateOnly };