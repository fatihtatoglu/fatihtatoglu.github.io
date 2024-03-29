<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
	xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
	xmlns:xhtml="http://www.w3.org/1999/xhtml">

	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Site Haritası</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: monospace;
						font-size:13px;
					}
					
					#intro {
						background-color:#CFEBF7;
						border:1px #2580B2 solid;
						padding:5px 13px 5px 13px;
						margin:10px;
					}
					
					#intro p {
						line-height:	16.8667px;
					}
					
					td {
						font-size:11px;
					}
					
					th {
						text-align:left;
						padding-right:30px;
						font-size:11px;
					}
					
					tr.high {
						background-color:whitesmoke;
					}
					
					#footer {
						padding:2px;
						margin:10px;
						font-size:8pt;
						color:gray;
					}
					
					#footer a {
						color:gray;
					}
					
					a {
						color:black;
					}
				</style>
			</head>
			<body>
				<h1>XML Site Haritası</h1>
				<div id="intro">
					<p xmlns="http://www.w3.org/1999/xhtml">Bu <a href="https://www.google.com/">Google</a> veya <a href="https://www.bing.com/">Bing</a> gibi arama motorlarının kullanımı için oluşturulmuş bir XML Site Haritasıdır.</p>
					<p xmlns="http://www.w3.org/1999/xhtml">XML site haritaları hakkında daha fazla bilgiyi <a href="https://sitemaps.org">sitemaps.org</a> adresinde bulabilirsiniz</p>
				</div>
				<div id="content">
					<table cellpadding="5">
						<tr style="border-bottom:1px black solid;">
							<th>#</th>
							<th>URL</th>
							<th>Son Değişiklik</th>
						</tr>
						<xsl:for-each select="sitemap:urlset/sitemap:url">
							<tr>
								<xsl:if test="position() mod 2 != 1">
									<xsl:attribute name="class">high</xsl:attribute>
								</xsl:if>
								<td xmlns="http://www.w3.org/1999/xhtml">
									<xsl:value-of xmlns:xsl="http://www.w3.org/1999/XSL/Transform" select="position()"/>
								</td>
								<td>
									<xsl:variable name="itemURL">
										<xsl:value-of select="sitemap:loc"/>
									</xsl:variable>
									<a href="{$itemURL}">
										<xsl:value-of select="sitemap:loc"/>
									</a>
								</td>
								<td>
									<xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
								</td>
							</tr>
						</xsl:for-each>
					</table>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>