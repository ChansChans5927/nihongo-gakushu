import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");

// URLs
const KANJI_URL = "https://raw.githubusercontent.com/AnchorI/jlpt-kanji-dictionary/master/jlpt-kanji.json";
const VOCAB_URLS: Record<string, string> = {
  N5: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv",
  N4: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n4.csv",
  N3: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n3.csv",
  N2: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n2.csv",
  N1: "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n1.csv",
};

async function downloadKanji() {
  console.log("[Kanji] Downloading master kanji dataset...");
  const response = await fetch(KANJI_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch kanji data: ${response.statusText}`);
  }
  
  const rawData = await response.json();
  const kanjiByLevel: Record<string, string[]> = {
    N5: [],
    N4: [],
    N3: [],
    N2: [],
    N1: [],
  };

  if (Array.isArray(rawData)) {
    for (const item of rawData) {
      if (item && item.kanji && item.jlpt) {
        const level = item.jlpt.toUpperCase(); // "N5", "N4" 등
        if (kanjiByLevel[level]) {
          kanjiByLevel[level].push(item.kanji);
        }
      }
    }
  }

  const destPath = path.join(DATA_DIR, "kanji_master.json");
  fs.writeFileSync(destPath, JSON.stringify(kanjiByLevel, null, 2), "utf8");
  console.log(`[Kanji] Successfully written master kanji list to ${destPath}`);
}

async function downloadVocab() {
  console.log("[Vocab] Downloading master vocab dataset...");
  const vocabByLevel: Record<string, { word: string; reading: string }[]> = {
    N5: [],
    N4: [],
    N3: [],
    N2: [],
    N1: [],
  };

  for (const [level, url] of Object.entries(VOCAB_URLS)) {
    console.log(`[Vocab] Fetching ${level} vocabulary CSV...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch vocab data for ${level}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);
    
    // First line is header (expression,reading,meaning,tags,guid)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",");
      if (cols.length >= 2) {
        const word = cols[0].trim();
        const reading = cols[1].trim();
        
        // Skip header duplicates or invalid rows
        if (word === "expression" || !word || !reading) continue;
        
        vocabByLevel[level].push({ word, reading });
      }
    }
    console.log(`[Vocab] Parsed ${vocabByLevel[level].length} items for ${level}.`);
  }

  const destPath = path.join(DATA_DIR, "vocab_master.json");
  fs.writeFileSync(destPath, JSON.stringify(vocabByLevel, null, 2), "utf8");
  console.log(`[Vocab] Successfully written master vocab list to ${destPath}`);
}

async function main() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    await downloadKanji();
    await downloadVocab();
    console.log("Master data initialization completed successfully.");
  } catch (err) {
    console.error("Error downloading master datasets:", err);
    process.exit(1);
  }
}

main();
