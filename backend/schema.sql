CREATE TABLE articles (
    _id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT,
    excerpt TEXT,
    isBreaking BOOLEAN DEFAULT FALSE,
    date TEXT NOT NULL,
    image TEXT,
    imageCredit TEXT
);

CREATE TABLE categories (
    name TEXT PRIMARY KEY,
    article_ids TEXT NOT NULL DEFAULT '[]' -- JSON array of article IDs
);

CREATE TABLE breaking_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_ids TEXT NOT NULL DEFAULT '[]' -- JSON array of article IDs
);

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    _id TEXT NOT NULL
);