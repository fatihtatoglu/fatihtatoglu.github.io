<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rss="http://purl.org/rss/1.0/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>RSS Feed</title>
        <style>
          body {
            font-family: "Inter", "Helvetica Neue", Helvetica, Arial, ui-sans-serif,
              system-ui, sans-serif;
            max-width: 720px;
            margin: 2rem auto;
            padding: 0 1rem;
            background: #020617;
            color: #f1f5f9;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          p {
            margin-top: 0;
            margin-bottom: 1.5rem;
            color: #64748b;
          }
          ul {
            list-style: none;
            padding-left: 0;
          }
          li {
            margin-bottom: 1.25rem;
            border-bottom: 1px solid #1f2937;
            padding-bottom: 1rem;
          }
          a {
            color: #5a8df0;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          a:visited {
            color: #7ea7f6;
          }
          .title {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          .meta {
            font-size: 0.75rem;
            color: #cbd5e1;
            margin-bottom: 0.5rem;
          }
        </style>
      </head>
      <body>
        <h1>
          <xsl:value-of select="/rss/channel/title" />
        </h1>
        <p>
          <xsl:value-of select="/rss/channel/description" />
        </p>
        <ul>
          <xsl:for-each select="/rss/channel/item">
            <li>
              <div class="title">
                <a href="{link}">
                  <xsl:value-of select="title" />
                </a>
              </div>
              <div class="meta">
                <xsl:value-of select="pubDate" />
                <xsl:if test="category">
                  <xsl:text> · </xsl:text>
                  <xsl:value-of select="category" />
                </xsl:if>
              </div>
              <div class="description">
                <xsl:value-of select="description" disable-output-escaping="yes" />
              </div>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
