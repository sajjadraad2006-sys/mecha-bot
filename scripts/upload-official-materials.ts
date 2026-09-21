/**
 * Script to upload official materials to Telegram cloud storage and retrieve TELEGRAM_FILE_ID
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const BOT_TOKEN = '8807584013:AAHRjLnZOUV58EwA9L7TvkrGX6_fWtz_hbI';
const CHAT_ID = '1417868079'; // Admin Chat ID

const FILES = [
  {
    filename: '1651836034.pdf',
    title: '📖 ميكانيك الموائع 1 — د. خالد باقر سليم',
    courseCode: 'MCT313',
  },
  {
    filename: '1662098990.pdf',
    title: '📖 الاهتزازات الميكانيكية المتقدمة — د. جعفر خلف',
    courseCode: 'MCT312',
  },
  {
    filename: '1687296365.pdf',
    title: '📖 هندسة السيطرة والأنظمة الديناميكية — د. منى هادي',
    courseCode: 'MCT311',
  },
  {
    filename: '1687380480.pdf',
    title: '📖 مقاومة وميكانيك المواد — م. محمد يعقوب يوسف',
    courseCode: 'MCT212',
  },
  {
    filename: '1688291090.pdf',
    title: '📖 أنظمة المعالجات الدقيقة والمتحكمات — د. حسنين علي',
    courseCode: 'MCT314',
  },
  {
    filename: '1727623180.pdf',
    title: '📖 نظرية الآلات والميكانيزمات — د. ضياء جاسم',
    courseCode: 'MCT213',
  },
  {
    filename: '1746991329.pdf',
    title: '📖 الميكانيك الهندسي (ستاتيك) — د. رائد ناصر',
    courseCode: 'MCT115',
  },
  {
    filename: '3437Mechatronics Engineering.pdf',
    title: '📘 الدليل الأكاديمي الشامل لقسم هندسة الميكاترونكس — جامعة البصرة',
    courseCode: 'MCT110',
  },
  {
    filename: '6193mec. courses.pdf',
    title: '📋 جدول وتوزيع المقررات الرسمية لقسم هندسة الميكاترونكس — جامعة البصرة',
    courseCode: 'MCT001',
  },
  {
    filename: '1632289199.pdf',
    title: '📚 الكتاب المنهجي والمرجع المعتمد في هندسة الميكاترونكس — جامعة البصرة',
    courseCode: 'MCT110',
  },
];

async function main() {
  console.log('🚀 Starting upload of official materials to Telegram...');
  const results: Record<string, { fileId: string; uniqueId: string; size: number }> = {};

  // First check if 1651836034 already uploaded
  results['1651836034.pdf'] = {
    fileId: 'BQACAgIAAxkDAAMmarFQSDfcDZft9OOrBox6hobDKqMAArK2AAI6EZFJhI-7NoBK5xI9BA',
    uniqueId: 'AgADsrYAAjoRkUk',
    size: 656811,
  };

  for (const item of FILES) {
    const existing = results[item.filename];
    if (existing) {
      console.log(`✅ Already uploaded: ${item.filename} -> ${existing.fileId}`);
      continue;
    }

    const filePath = path.resolve(process.cwd(), 'مصادر', item.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    console.log(`📤 Uploading ${item.filename} (${item.title})...`);
    const fileData = fs.readFileSync(filePath);
    const blob = new Blob([fileData], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', item.title);
    formData.append('document', blob, item.filename);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const data = (await res.json()) as {
      ok: boolean;
      description?: string;
      result?: {
        document?: {
          file_id: string;
          file_unique_id: string;
          file_size: number;
        };
      };
    };

    if (data.ok && data.result?.document) {
      results[item.filename] = {
        fileId: data.result.document.file_id,
        uniqueId: data.result.document.file_unique_id,
        size: data.result.document.file_size,
      };
      console.log(`✅ Success: ${item.filename} -> ${data.result.document.file_id}`);
    } else {
      console.error(`❌ Failed: ${item.filename}: ${data.description}`);
    }

    // Short pause between uploads to avoid Telegram rate limits
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log('\n📊 Final Telegram File IDs:');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('./scripts/telegram-file-ids.json', JSON.stringify(results, null, 2), 'utf8');
}

main().catch(console.error);
