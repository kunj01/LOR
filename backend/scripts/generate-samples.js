import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";

import {
  generateLetterHeadForm,
  generateLORRecommendationForm,
} from "../src/utils/pdfGenerator.js";

(async () => {
  try {
    const outDir = path.join(process.cwd(), "generated-pdfs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const sample1 = {
      letterHeadType: "CSPIT",
      studentFullName: "John Doe",
      studentId: "S123456",
      purpose:
        "To apply for internship at ABC Corp. Need official letterhead for application.",
      copies: 2,
      date: "01/11/2025",
    };

    const out1 = path.join(outDir, `sample-letter-head-${Date.now()}.pdf`);
    await generateLetterHeadForm(sample1, out1);
    console.log("Generated sample letter head PDF at", out1);

    // const sample2 = {
    //   studentFullName: 'Jane Roe',
    //   studentName: 'Jane Roe',
    //   studentId: 'S654321',
    //   emailId: 'jane.roe@example.com',
    //   purpose: 'Recommendation for higher studies',
    //   copies: 1,
    //   date: '01/11/2025',
    //   requestId: 999
    // };

    // const out2 = path.join(outDir, `sample-lor-recommendation-${Date.now()}.pdf`);
    // await generateLORRecommendationForm(sample2, out2);
    // console.log('Generated sample LOR recommendation PDF at', out2);

    process.exit(0);
  } catch (err) {
    console.error("Error generating samples:", err);
    process.exit(1);
  }
})();
