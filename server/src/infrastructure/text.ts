import sanitizeHtml from 'sanitize-html';

function breakTextIntoParagraphs(text: string) {
  const lines = text.split('\n');
  let output = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '') {
      continue;
    }

    output += `<p>${line}</p>`;
  }

  return output;
}

function convertUrlsInPlainTextToHTML(text: string) {
  const urls = text.match(/https*:\/\/[^\s<),]+[^\s<),.]/gim) ?? [];
  const uniqueUrls = [...new Set(urls)];
  let output = text;

  for (const uniqueUrl of uniqueUrls) {
    const anchorHTML = `<a href="${uniqueUrl}" target="_blank">${uniqueUrl}</a>`;

    output = output.replaceAll(uniqueUrl, anchorHTML);
  }

  return output;
}

function convertMailsInPlainTextToHTML(text: string) {
  const mails = text.match(/[\w\-\.]+@([\w-]+\.)+[\w-]{2,}/gm) ?? [];
  const uniqueMails = [...new Set(mails)];
  let output = text;

  for (const uniqueMail of uniqueMails) {
    const mailAnchorHTML = `<a href="mailto:${uniqueMail}" target="_blank">${uniqueMail}</a>`;

    output = output.replaceAll(uniqueMail, mailAnchorHTML);
  }

  return output;
}

export function convertPlainTextToHTML(text: string | null) {
  if (text === null) {
    return null;
  }

  return convertMailsInPlainTextToHTML(
    convertUrlsInPlainTextToHTML(
      breakTextIntoParagraphs(
        sanitizeHtml(text, {
          allowedTags: ['br', 'a', 'b', 'i', 'strong', 'p'],
          allowedAttributes: {
            a: ['href', 'target'],
          },
        }),
      ),
    ),
  );
}
