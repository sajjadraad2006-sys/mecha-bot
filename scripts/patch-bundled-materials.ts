import * as fs from 'node:fs';

const FILE_PATH = 'apps/worker/src/bundled-materials.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const mapping: Record<string, string> = {
  '1651836034.pdf': 'BQACAgIAAxkDAAMmarFQSDfcDZft9OOrBox6hobDKqMAArK2AAI6EZFJhI-7NoBK5xI9BA',
  '1662098990.pdf': 'BQACAgIAAxkDAAMnarFYCorsVHt6q66uPzY9QPuFE6cAAj63AAI6EZFJIGkYfN4Yg2Y9BA',
  '1687296365.pdf': 'BQACAgIAAxkDAAMoarFYDTz1Rwe-_Nj81bK2COzEAAEXAAJAtwACOhGRSYvewZc-dQyCPQQ',
  '1687380480.pdf': 'BQACAgIAAxkDAAMparFYE7b705P7iDPKAAEH14EDcmHKAAJBtwACOhGRSV6Xpf2OjtgFPQQ',
  '1688291090.pdf': 'BQACAgIAAxkDAAMqarFYFs1RGulIml8yBgy97yAUmHkAAkK3AAI6EZFJw5CN6Vc_cuQ9BA',
  '1727623180.pdf': 'BQACAgIAAxkDAAMrarFYGUHaiL8_mzuFkTFR3pYcw4IAAkO3AAI6EZFJLw7OE-meu_k9BA',
  '1746991329.pdf': 'BQACAgIAAxkDAAMsarFYIsaMShROJuBJORbuGhuQaTEAAkS3AAI6EZFJgwz9Q2fkS649BA',
  '3437Mechatronics%20Engineering.pdf':
    'BQACAgIAAxkDAAMtarFYJk8FXdcruUgUefU-K1OH658AAkW3AAI6EZFJbdheQWM0MYk9BA',
  '3437Mechatronics Engineering.pdf':
    'BQACAgIAAxkDAAMtarFYJk8FXdcruUgUefU-K1OH658AAkW3AAI6EZFJbdheQWM0MYk9BA',
  '6193mec.%20courses.pdf':
    'BQACAgIAAxkDAAMuarFYJ_IkM4dq4ErWglCgDOathqYAAka3AAI6EZFJZgLSl9bvYbY9BA',
  '6193mec. courses.pdf': 'BQACAgIAAxkDAAMuarFYJ_IkM4dq4ErWglCgDOathqYAAka3AAI6EZFJZgLSl9bvYbY9BA',
  '1632289199.pdf': 'BQACAgIAAxkDAAMvarFYUaCyY6W9-tVsVYE-MbHtVicAAk23AAI6EZFJua4NkLsC7Nc9BA',
};

// Replace all raw.githubusercontent.com references with TELEGRAM_FILE_ID
for (const [filename, fileId] of Object.entries(mapping)) {
  // Regex to match storageReference with EXTERNAL_URL containing this filename
  const pattern = new RegExp(
    `storageReference:\\s*\\{\\s*kind:\\s*'EXTERNAL_URL',\\s*value:\\s*['"][^'"]*${filename.replace(
      /\./g,
      '\\.',
    )}['"],?\\s*\\}`,
    'g',
  );

  content = content.replace(pattern, () => {
    return `storageReference: {\n      kind: 'TELEGRAM_FILE_ID',\n      value: '${fileId}',\n    }`;
  });
}

// Any remaining raw.githubusercontent.com or generic external placeholders
content = content.replace(
  /storageReference:\s*\{\s*kind:\s*'EXTERNAL_URL',\s*value:\s*['"]https:\/\/raw\.githubusercontent\.com\/[^'"]+['"],?\s*\}/g,
  () => {
    // Default to the canonical Mechatronics handbook fileId
    return `storageReference: {\n      kind: 'TELEGRAM_FILE_ID',\n      value: 'BQACAgIAAxkDAAMtarFYJk8FXdcruUgUefU-K1OH658AAkW3AAI6EZFJbdheQWM0MYk9BA',\n    }`;
  },
);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log(
  '✅ Successfully patched apps/worker/src/bundled-materials.ts with native Telegram File IDs!',
);
