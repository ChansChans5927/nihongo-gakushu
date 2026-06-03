import { MongoClient } from "mongodb";
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

    console.log("Connected to MongoDB for update.");

    // 1. kanjis: 水 (물 수) 훈독 교정
    const kanjiRes = await db.collection("kanjis").updateOne(
      { kanji: "水" },
      { $set: { hunyomi: "みず", hunyomiKorean: "미즈" } }
    );
    console.log(`Updated 水 in kanjis: Modified ${kanjiRes.modifiedCount} document(s).`);

    // 2. vocabs 교정
    // 2-1. 会社員
    const v1 = await db.collection("vocabs").updateOne(
      { word: "会社員" },
      { $set: { "exampleSentence.japanese": "兄は会社員として働いています。" } }
    );
    console.log(`Updated 会社員: Modified ${v1.modifiedCount} document(s).`);

    // 2-2. 経済
    const v2 = await db.collection("vocabs").updateOne(
      { word: "経済" },
      { $set: { "exampleSentence.japanese": "最近国の経済が良くなっています。" } }
    );
    console.log(`Updated 経済: Modified ${v2.modifiedCount} document(s).`);

    // 2-3. 彫刻
    const v3 = await db.collection("vocabs").updateOne(
      { word: "彫刻" },
      { $set: { pronunciation: "쵸우코쿠" } }
    );
    console.log(`Updated 彫刻: Modified ${v3.modifiedCount} document(s).`);

    // 2-4. 涼しい
    const v4 = await db.collection("vocabs").updateOne(
      { word: "涼しい" },
      { $set: { "exampleSentence.japanese": "秋の風は涼しい。" } }
    );
    console.log(`Updated 涼しい: Modified ${v4.modifiedCount} document(s).`);

    // 2-5. 歩く
    const v5 = await db.collection("vocabs").updateOne(
      { word: "歩く" },
      { $set: { "exampleSentence.japanese": "公園を歩く。" } }
    );
    console.log(`Updated 歩く: Modified ${v5.modifiedCount} document(s).`);

    // 2-6. 詳しい
    const v6 = await db.collection("vocabs").updateOne(
      { word: "詳しい" },
      { $set: { "exampleSentence.japanese": "この分野に詳しい。" } }
    );
    console.log(`Updated 詳しい: Modified ${v6.modifiedCount} document(s).`);

    // 2-7. 省みる
    const v7 = await db.collection("vocabs").updateOne(
      { word: "省みる" },
      { $set: { "exampleSentence.japanese": "過去の過ちを省みる。" } }
    );
    console.log(`Updated 省みる: Modified ${v7.modifiedCount} document(s).`);

    // 2-8. 休む
    const v8 = await db.collection("vocabs").updateOne(
      { word: "休む" },
      { $set: { "exampleSentence.japanese": "今日は風邪を引いたので、学校を休む。" } }
    );
    console.log(`Updated 休む: Modified ${v8.modifiedCount} document(s).`);

    // 3. vocab_quizzes 교정
    // 3-1. 経済 (해설에서 けいざ이 -> けいざい)
    const quiz1 = await db.collection("vocab_quizzes").findOne({ targetWord: "経済" });
    if (quiz1 && quiz1.explanation) {
      const newExpl = quiz1.explanation.replace("けいざ이", "けいざい");
      const q1_res = await db.collection("vocab_quizzes").updateOne(
        { _id: quiz1._id },
        { $set: { explanation: newExpl } }
      );
      console.log(`Updated 経済 quiz explanation: Modified ${q1_res.modifiedCount} document(s).`);
    }

    // 3-2. 話す (선택지 중 must_not_use_this_key -> 聞きます)
    const quiz2 = await db.collection("vocab_quizzes").findOne({ targetWord: "話す" });
    if (quiz2 && Array.isArray(quiz2.choices)) {
      const newChoices = quiz2.choices.map((c: string) => {
        return c.trim() === "must_not_use_this_key" ? "聞きます" : c;
      });
      const q2_res = await db.collection("vocab_quizzes").updateOne(
        { _id: quiz2._id },
        { $set: { choices: newChoices } }
      );
      console.log(`Updated 話す quiz choices: Modified ${q2_res.modifiedCount} document(s).`);
    }

  } catch (err) {
    console.error("Error during DB update:", err);
  } finally {
    await client.close();
  }
}

run();
