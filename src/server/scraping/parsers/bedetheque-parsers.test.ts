import { describe, expect, it } from "vitest";
import { loadHtml } from "../utils/html";
import {
  extractSourceSeriesIdFromSerieUrl,
  parseSeriesMeta,
  planSerieAlbumPageUrls,
} from "./bedetheque-series.parser";
import { parseAlbumsFromListe } from "./bedetheque-album.parser";

const MINI_SERIE_HTML = `<!DOCTYPE html><html><head><title>Test</title>
<meta name="description" content="Résumé série de test." />
</head><body>
<input type="hidden" id="IdSerie" value="6" />
<article class="bandeau-large">
<div class="bandeau-info serie">
  <h1><a href="serie-6-BD-Lanfeust-de-Troy.html">Lanfeust de Troy</a></h1>
  <h3><span class="style">Heroic Fantasy</span>
  <span><i class="icon-book"></i> 32 albums</span>
  </h3>
</div>
</article>
<ul class="serie-info">
  <li><label>Genre :</label><span class="style-serie">Heroic Fantasy</span></li>
  <li><label>Parution :</label><span class="parution-serie">Série finie</span></li>
  <li><label>Tomes :</label>9</li>
  <li><label>Identifiant :</label>6</li>
</ul>
<div class="pagination">
  <span class="current">1</span>
  <a href="https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy__1.html">2</a>
  <a href="https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy__10000.html">Tout</a>
</div>
<ul class="liste-albums">
  <li>
    <a name="740"></a>
    <div class="album-side">
      <div class="couv">
        <a class="titre" href="/BD-Lanfeust-de-Troy-Tome-1-740.html">
          <img src="/cache/thb_couv/Couv_740.jpg" alt="couv" />
        </a>
      </div>
    </div>
    <div class="album-main">
      <h3><a class="titre" href="/BD-Lanfeust-de-Troy-Tome-1-740.html"><span itemprop="name">1<span class="numa"></span>. L'Ivoire du Magohamoth</span></a></h3>
      <div class="eval"><label>Evaluation :</label></div>
      <p class="message">Note: <strong>3.9</strong>/5 (268 votes)</p>
      <ul class="infos">
        <li><label>Identifiant : </label>740</li>
        <li><label>Scénario :</label><a href="/a.html">Arleston</a></li>
        <li><label>Dessin :</label><a href="/b.html">Tarquin</a></li>
        <li><label>ISBN :</label>2877642577</li>
        <li><label>Planches :</label>44</li>
        <li><label>Estimation :</label>de 100 à 150 euros</li>
        <li><label>Dépot légal :</label>10/1994</li>
      </ul>
    </div>
  </li>
</ul>
</body></html>`;

describe("bedetheque-series.parser", () => {
  it("extrait l’identifiant série depuis l’URL", () => {
    expect(
      extractSourceSeriesIdFromSerieUrl(
        "https://www.bedetheque.com/serie-2326-BD-Donjon-Crepuscule.html"
      )
    ).toBe("2326");
  });

  it("parse les métadonnées série", () => {
    const $ = loadHtml(MINI_SERIE_HTML);
    const meta = parseSeriesMeta($, "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html");
    expect(meta.sourceSeriesId).toBe("6");
    expect(meta.titre).toBe("Lanfeust de Troy");
    expect(meta.nombreAlbumsSite).toBe(32);
    expect(meta.resume).toContain("Résumé série");
  });

  it("préfère la page Tout pour la pagination", () => {
    const $ = loadHtml(MINI_SERIE_HTML);
    const urls = planSerieAlbumPageUrls($, "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html");
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("__10000");
  });
});

describe("bedetheque-album.parser", () => {
  it("extrait un album depuis la liste", () => {
    const $ = loadHtml(MINI_SERIE_HTML);
    const { albums, errors } = parseAlbumsFromListe(
      $,
      "https://www.bedetheque.com/serie-6-BD-Lanfeust-de-Troy.html",
      "Lanfeust de Troy",
      "6"
    );
    expect(errors).toHaveLength(0);
    expect(albums).toHaveLength(1);
    expect(albums[0].sourceAlbumId).toBe("740");
    expect(albums[0].titre).toContain("Ivoire");
    expect(albums[0].isbn).toBe("2877642577");
    expect(albums[0].pages).toBe(44);
    expect(albums[0].tome).toBe("1");
    expect(albums[0].note).toBe(3.9);
    expect(albums[0].nbVotes).toBe(268);
  });
});
