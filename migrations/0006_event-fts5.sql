-- Custom SQL migration file, put you code below! --

CREATE VIRTUAL TABLE IF NOT EXISTS event_fts USING fts5(segments);
