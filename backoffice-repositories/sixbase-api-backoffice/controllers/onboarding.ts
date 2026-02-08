import { Request, Response, NextFunction } from 'express';
import exceljs from 'exceljs';
import ApiError from '../error/ApiError';
import date from '../utils/helpers/date';
import {
  FRONTEND_DATE,
  ONLY_DATE,
  ONLY_TIME,
  DATABASE_DATE,
} from '../types/dateTypes';
import { capitalizeName } from '../utils/formatters';
import FindOnboardingPaginated from '../useCases/onboarding/FindOnboardingPaginated';
import FindOnboardingForExport from '../useCases/onboarding/FindOnboardingForExport';
import OnboardingRepository from '../repositories/sequelize/OnboardingRepository';
import { onboardingAnswers, excelColumns } from '../mocks/onboarding.mock';
import {
  OnboardingRequest,
  OnboardingDailyCountsRequest,
  OnboardingData,
  OnboardingRecord,
  OnboardingDailyCount,
} from '../interfaces/onboarding.interface';

const serializeOnboarding = (data: OnboardingData) => {
  const { created_at, user_type, form_answers = {} } = data;

  const cleanAnswers = Object.fromEntries(
    Object.entries(form_answers).filter(([key, value]) => {
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== 'null' &&
        value !== '0'
      );
    }),
  );

  return {
    ...cleanAnswers,
    user_type,
    created_at: date(created_at as any).format(FRONTEND_DATE),
    date: date(created_at as any).format(ONLY_DATE),
    time: date(created_at as any).format(ONLY_TIME),
  };
};

export const findOnboarding = async (
  req: OnboardingRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: {
      input = null,
      has_sold = null,
      revenue = null,
      signup_reason = null,
      user_type = null,
      page = 0,
      size = 10,
      start_date,
      end_date,
      creator_version,
      marca_version,
    },
  } = req;

  try {
    let normalizedStart = start_date;
    let normalizedEnd = end_date;

    if (start_date)
      normalizedStart = date(new Date(start_date))
        .startOf('day')
        .utc()
        .format(DATABASE_DATE);

    if (end_date)
      normalizedEnd = date(new Date(end_date))
        .endOf('day')
        .utc()
        .format(DATABASE_DATE);

    const { count, rows } = await new FindOnboardingPaginated({
      input,
      has_sold,
      revenue,
      signup_reason,
      user_type,
      start_date: normalizedStart,
      end_date: normalizedEnd,
      page,
      size,
      creator_version:
        creator_version !== undefined ? Number(creator_version) : undefined,
      marca_version:
        marca_version !== undefined ? Number(marca_version) : undefined,
    }).executeWithSQL();

    const formattedRows: OnboardingRecord[] = rows
      .map((r: any) => {
        const { user, form } = r;

        if (!user) {
          console.warn('Onboarding record without user:', {
            id_user: r.id_user,
            form_id: r.form_id,
            created_at: r.created_at,
          });
          return null;
        }

        const userData = {
          uuid: user.uuid || '',
          full_name: user.full_name || '',
          email: user.email || '',
          instagram: user.instagram || undefined,
          tiktok: user.tiktok || undefined,
          document_number: user.document_number || '',
        };

        return {
          ...userData,
          full_name: capitalizeName(userData.full_name),
          onboarding: serializeOnboarding(r),
          form: form || null,
          marca: r,
        };
      })
      .filter((row) => row !== null); // <- Removido o type predicate que gerava erro

    return void res.json({ count, rows: formattedRows });
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const dailyCounts = async (
  req: OnboardingDailyCountsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: { start_date, end_date, user_type = null, creator_version, marca_version },
  } = req;

  try {
    const rows: OnboardingDailyCount[] =
      await OnboardingRepository.findOnboardingDailyCounts({
        start_date,
        end_date,
        user_type,
        creator_version:
          creator_version !== undefined ? Number(creator_version) : undefined,
        marca_version:
          marca_version !== undefined ? Number(marca_version) : undefined,
      });

    return void res.json(rows);
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getVersionCombinations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    const combinations = await OnboardingRepository.findVersionCombinations({
      start_date: start_date as string | undefined,
      end_date: end_date as string | undefined,
    });

    return void res.json(combinations);
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error, GET: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const exportOnboarding = async (
  req: OnboardingRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: { input = null, has_sold = null, revenue = null, signup_reason = null, user_type = null, start_date, end_date },
  } = req;

  const filename = `onboarding.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  const workbook = new exceljs.stream.xlsx.WorkbookWriter({
    filename,
    stream: res,
  });

  const worksheet = workbook.addWorksheet();
  worksheet.columns = excelColumns;

  try {
    const onboarding = await new FindOnboardingForExport({
      input,
      has_sold,
      revenue,
      signup_reason,
      user_type,
      start_date,
      end_date,
    }).executeWithSQL();

    for (const row of onboarding.rows) {
      const { user, ...rest } = row;

      worksheet
        .addRow({
          uuid: user.uuid,
          full_name: capitalizeName(user.full_name),
          email: user.email,
          instagram: user.instagram || ' - ',
          tiktok: user.tiktok || ' - ',
          document_number: user.document_number,
          ...serializeOnboarding(rest as OnboardingData),
        })
        .commit();
    }

    worksheet.commit();
    await workbook.commit();

    return void res.end();
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};