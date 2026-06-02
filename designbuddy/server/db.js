const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'designbuddy.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

async function initDb() {
  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function persist() {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  setInterval(persist, 5000);
  process.on('exit', persist);
  process.on('SIGINT', () => { persist(); process.exit(); });

  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id           TEXT PRIMARY KEY,
      session_id   TEXT NOT NULL,
      vibe         TEXT NOT NULL DEFAULT 'bold',
      prompt       TEXT NOT NULL DEFAULT '',
      score        INTEGER,
      summary      TEXT,
      issues       TEXT,
      suggestions  TEXT,
      code_snippet TEXT,
      image_count  INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_session ON analyses(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_created ON analyses(created_at);
  `);

  persist();

  const queries = {
    insertAnalysis(row) {
      db.run(
        `INSERT INTO analyses (id,session_id,vibe,prompt,score,summary,issues,suggestions,code_snippet,image_count)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [row.id, row.session_id, row.vibe, row.prompt, row.score,
         row.summary, row.issues, row.suggestions, row.code_snippet, row.image_count]
      );
      persist();
    },
    getAnalysisBySession(session_id) {
      const stmt = db.prepare(`SELECT * FROM analyses WHERE session_id=? ORDER BY created_at DESC LIMIT 50`);
      const rows = [];
      stmt.bind([session_id]);
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    getAllAnalyses() {
      const stmt = db.prepare(`SELECT * FROM analyses ORDER BY created_at DESC LIMIT 100`);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    getAnalysisById(id) {
      const stmt = db.prepare(`SELECT * FROM analyses WHERE id=?`);
      stmt.bind([id]);
      const row = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      return row;
    },
    deleteAnalysis(id) {
      db.run(`DELETE FROM analyses WHERE id=?`, [id]);
      persist();
    },
    getStats() {
      const stmt = db.prepare(`SELECT COUNT(*) as total_analyses, AVG(score) as avg_score, COUNT(DISTINCT session_id) as unique_sessions FROM analyses`);
      const row = stmt.step() ? stmt.getAsObject() : { total_analyses: 0, avg_score: null, unique_sessions: 0 };
      stmt.free();
      return row;
    }
  };

  return queries;
}

module.exports = { initDb };
