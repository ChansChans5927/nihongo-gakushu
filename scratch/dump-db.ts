import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("nihongo_gakushu");

    let output = "==================================================\n";
    output += "          nihongo_gakushu DB DUMP\n";
    output += "==================================================\n\n";

    // 1. Kanjis
    output += "--- [kanjis Collection] ---\n";
    const kanjis = await db.collection("kanjis").find({}).toArray();
    output += `Total items: ${kanjis.length}\n\n`;
    kanjis.forEach((k: any, idx) => {
      output += `${idx + 1}. 한자: ${k.kanji} (${k.meaning})\n`;
      output += `   음독: ${k.onyomi} (${k.onyomiKorean}) / 훈독: ${k.hunyomi} (${k.hunyomiKorean})\n`;
      output += `   연상 비법: ${k.mnemonic}\n`;
      if (k.relatedWords) {
        output += `   연관 단어: ${k.relatedWords.map((w: any) => `${w.word}(${w.meaning})`).join(", ")}\n`;
      }
      output += `--------------------------------------------------\n`;
    });

    output += "\n\n";

    // 2. Vocabs
    output += "--- [vocabs Collection] ---\n";
    const vocabs = await db.collection("vocabs").find({}).toArray();
    output += `Total items: ${vocabs.length}\n\n`;
    vocabs.forEach((v: any, idx) => {
      output += `${idx + 1}. 단어: ${v.word} (${v.hiragana} - ${v.meaning})\n`;
      output += `   발음: ${v.pronunciation} / JLPT: ${v.jlptLevel}\n`;
      if (v.exampleSentence) {
        output += `   예문: ${v.exampleSentence.japanese} -> ${v.exampleSentence.meaning}\n`;
      }
      output += `--------------------------------------------------\n`;
    });

    output += "\n\n";

    // 3. Vocab Quizzes
    output += "--- [vocab_quizzes Collection] ---\n";
    const quizzes = await db.collection("vocab_quizzes").find({}).toArray();
    output += `Total items: ${quizzes.length}\n\n`;
    quizzes.forEach((q: any, idx) => {
      output += `${idx + 1}. 타겟 단어: ${q.targetWord} (유형: ${q.type})\n`;
      output += `   질문: ${q.questionText}\n`;
      if (q.questionSentence) {
        output += `   문장: ${q.questionSentence}\n`;
      }
      output += `   선택지: ${q.choices.join(", ")} (정답 인덱스: ${q.correctIndex})\n`;
      output += `   해설: ${q.explanation}\n`;
      output += `--------------------------------------------------\n`;
    });

    const scratchDir = path.join(process.cwd(), "scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir);
    }
    const outputPath = path.join(scratchDir, "db_dump.txt");
    fs.writeFileSync(outputPath, output, "utf8");

    console.log(`Successfully dumped ${kanjis.length} kanjis, ${vocabs.length} vocabs, and ${quizzes.length} quizzes to ${outputPath}`);
  } catch (err) {
    console.error("Error during DB dump:", err);
  } finally {
    await client.close();
  }
}

run();
