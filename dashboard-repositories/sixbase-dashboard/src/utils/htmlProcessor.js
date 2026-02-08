export const processEditorHtml = (html) => {
  if (!html) return '';

  let processed = html;

  processed = processed.replace(/>([^<]*)</g, (match, content) => {
    const processedContent = content.replace(/  +/g, (spaces) => {
      return '&nbsp;'.repeat(spaces.length);
    });
    return `>${processedContent}<`;
  });

  processed = processed.replace(
    /<a\s+href="([^"]+)"[^>]*>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">'
  );

  processed = processed.replace(/ style="[^"]*"/gi, '');
  processed = processed.trim();

  return processed;
};

export const prepareHtmlForEditor = (html) => {
  if (!html) return '';

  let processed = html;

  processed = processed.replace(/&nbsp;/g, '\u00A0');

  processed = processed.replace(/<p>[ \t\r\n]+/gi, '<p>');
  processed = processed.replace(/[ \t\r\n]+<\/p>/gi, '</p>');

  return processed;
};

export const sanitizeHtml = (html) => {
  if (!html) return '';

  let clean = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  clean = clean.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ''
  );

  return clean;
};
