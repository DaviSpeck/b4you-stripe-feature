// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = (obj) => Object.keys(obj).length === 0;

// ** Returns K format from a number
export const kFormatter = (num) =>
  num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

// ** Converts HTML to string
export const htmlToString = (html) => html.replace(/<\/?[^>]+(>|$)/g, '');

// ** Checks if the passed date is today
const isToday = (date) => {
  const today = new Date();
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  );
};

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (
  value,
  formatting = { month: 'short', day: 'numeric', year: 'numeric' },
) => {
  if (!value) return value;
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

export const capitalizeName = (name) => {
  if (!name) return '';
  name = name
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(
        `\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`,
        'g',
      ),
      prepos[i],
    );
  }

  return name;
};

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value);
  let formatting = { month: 'short', day: 'numeric' };

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' };
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value));
};

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem('userData');
export const getUserData = () => JSON.parse(localStorage.getItem('userData'));

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = (userRole) => {
  if (userRole === 'admin') return '/';
  if (userRole === 'client') return '/access-control';
  return '/login';
};

// ** React Select Theme Colors
export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#4DD0BB1a', // for option hover bg-color
    primary: '#4DD0BB', // for selected option bg-color
    neutral10: '#4DD0BB', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed', // for input hover border-color
  },
});

// ** Return currency format
export const FormatBRL = (amount) => {
  if (amount == null || isNaN(amount) || amount === '') {
    amount = 0;
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDocument = (document, type = 'CPF') => {
  if (!document) return '-';
  if (type === 'CPF')
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return document.replace(
    /^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/,
    '$1.$2.$3/$4-$5',
  );
};

export const downloadFromResponse = (blob, filename) => {
  // Create blob link to download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode.removeChild(link);
};

export const maskPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})(\d)/, '$1-$2');
};


export const formatWhatsappPhone = (whatsappNumber) => {
  if (!whatsappNumber) {
    return null;
  }

  const onlyDigits = whatsappNumber.replace(/\D/g, '');

  if (!onlyDigits) {
    return null;
  }

  let numberWithoutCountryCode = onlyDigits;
  if (onlyDigits.startsWith('55') && onlyDigits.length > 11) {
    numberWithoutCountryCode = onlyDigits.substring(2);
  }

  if (numberWithoutCountryCode.length < 10 || numberWithoutCountryCode.length > 11) {
    return null;
  }
  return `55${numberWithoutCountryCode}`;
}