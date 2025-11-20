<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Sitemap</title>
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
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          th,
          td {
            padding: 0.4rem 0.5rem;
            border-bottom: 1px solid #1f2937;
          }
          th {
            text-align: left;
            font-weight: 600;
            color: #cbd5e1;
          }
          tbody tr:nth-child(even) {
            background-color: #070f1f;
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
          .muted {
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="muted">
          This sitemap lists canonical URLs discovered during the static build.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td>
                  <a href="{s:loc}">
                    <xsl:value-of select="s:loc" />
                  </a>
                </td>
                <td>
                  <span class="muted">
                    <xsl:value-of select="s:lastmod" />
                  </span>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
