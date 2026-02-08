import moment from 'moment';

const FRIDAY = 5;
const SATURDAY = 6;

const dateHelper =
  (dateParser) =>
  (date = new Date(), dateFormat = '') => {
    const Date = dateParser(date, dateFormat);
    return {
      add: (number, type) => Date.add(number, type),
      diff: (dateToCompare, duration) => Date.diff(dateToCompare, duration),
      format: (newFormat) => Date.utc(-3).format(newFormat),
      formatFromUnix: (unixTime, outputFormat) => dateParser.unix(unixTime).format(outputFormat),
      isValid: () => Date.isValid(),
      now: () => Date,
      startOfMonth: () => Date.startOf('month'),
      subtract: (number, type) => Date.subtract(number, type),
      toUnix: () => Date.valueOf(),
      startOf: (duration) => Date.startOf(duration),
      endOf: (duration) => Date.endOf(duration),
      isBefore: (dateToCompare) => Date.isBefore(dateToCompare),
      isSame: (dateToCompare) => Date.isSame(dateToCompare),
      isAfter: (dateToCompare) => Date.isAfter(dateToCompare),
      nextBusinessDate: () => {
        const weekDay = Date.day();
        if (weekDay === FRIDAY) return Date.add(3, 'd');
        if (weekDay === SATURDAY) return Date.add(2, 'd');
        return Date.add(1, 'd');
      },
    };
  };

export const date = dateHelper(moment);
