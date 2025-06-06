CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_date ON articles(date DESC);
CREATE INDEX idx_articles_isBreaking ON articles(isBreaking);