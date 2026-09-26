export interface IEvidenceChunk {
  source_id: string;
  title: string;
  content: string;
  url: string;
  score: number;
  source_type: 'official_documentation' | 'scientific_dataset' | 'verified_catalog';
}
const TRUSTED_EVIDENCE_STORE: IEvidenceChunk[] = [
  {
    source_id: 'ISRO-DOC-CARTOSAT3',
    title: 'ISRO Cartosat-3 Technical Specifications Manual',
    content: 'Cartosat-3 is an advanced third-generation high-resolution agile satellite with a spatial resolution of 0.28 meters in Panchromatic mode and 1.12 meters in 4 Multispectral bands across a 17 km swath. It operates in a 509 km sun-synchronous orbit.',
    url: 'https://www.isro.gov.in/Cartosat_3.html',
    score: 0.96,
    source_type: 'official_documentation'
  },
  {
    source_id: 'ISRO-DOC-LISS4',
    title: 'ISRO EOS-04 LISS-IV Spectral Band & Glacial Telemetry Guide',
    content: 'The Linear Imaging Self-Scanning Sensor IV (LISS-IV) operates in three spectral bands: Green (0.52-0.59 µm), Red (0.62-0.68 µm), and Near-Infrared (0.77-0.86 µm). It provides 5.8-meter spatial resolution and is used for agricultural crop monitoring and Himalayan glacial lake outburst flood risk assessment.',
    url: 'https://www.isro.gov.in/EOS_04.html',
    score: 0.94,
    source_type: 'official_documentation'
  },
  {
    source_id: 'ESA-DOC-SENTINEL1',
    title: 'ESA Copernicus Sentinel-1 C-Band SAR User Guide',
    content: 'Sentinel-1 carries a 5.405 GHz C-band Synthetic Aperture Radar (C-SAR) instrument capable of all-weather, day-and-night imaging. It operates in dual polarization (VV+VH or HH+HV) providing cloud-penetrating surface texture mapping over coastal flood corridors.',
    url: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-1',
    score: 0.92,
    source_type: 'official_documentation'
  },
  {
    source_id: 'ESA-DOC-SENTINEL2',
    title: 'ESA Copernicus Sentinel-2 MultiSpectral Instrument Guide',
    content: 'Sentinel-2 samples 13 spectral bands from VNIR to SWIR: 10m spatial resolution for RGB and NIR (Band 8), 20m for Red Edge and SWIR (Bands 11/12), and 60m for atmospheric correction. Normalized Difference Water Index (NDWI) is computed as (B3 - B8) / (B3 + B8).',
    url: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2',
    score: 0.95,
    source_type: 'official_documentation'
  },
  {
    source_id: 'USGS-DOC-LANDSAT9',
    title: 'USGS Landsat-9 OLI-2 & TIRS-2 Data Users Handbook',
    content: 'Landsat-9 measures Earth surface features with 15m Panchromatic, 30m Multispectral, and 100m Thermal Infrared resolutions. Revisit time is 16 days individually, or 8 days when combined with Landsat-8 in sun-synchronous orbit.',
    url: 'https://www.usgs.gov/landsat-missions/landsat-9',
    score: 0.91,
    source_type: 'official_documentation'
  }
];

export class RAGEngine {
  public static retrieveEvidence(userQuery: string): IEvidenceChunk[] {
    const q = userQuery.toLowerCase();
    const retrieved: IEvidenceChunk[] = [];

    for (const doc of TRUSTED_EVIDENCE_STORE) {
      let matchCount = 0;
      const docLower = (doc.title + ' ' + doc.content).toLowerCase();

      // Require explicit mission identifier or technical spec query matches
      const mentionsCartosat = (q.includes('cartosat') || q.includes('carto')) && docLower.includes('cartosat');
      const mentionsLiss = (q.includes('liss') || q.includes('eos-04') || q.includes('eos04')) && docLower.includes('liss');
      const mentionsSentinel1 = (q.includes('sentinel-1') || q.includes('sentinel 1') || q.includes('sar')) && docLower.includes('sentinel-1');
      const mentionsSentinel2 = (q.includes('sentinel-2') || q.includes('sentinel 2') || q.includes('msi')) && docLower.includes('sentinel-2');
      const mentionsLandsat = (q.includes('landsat') || q.includes('oli') || q.includes('tirs')) && docLower.includes('landsat');

      if (mentionsCartosat) matchCount += 4;
      if (mentionsLiss) matchCount += 4;
      if (mentionsSentinel1) matchCount += 4;
      if (mentionsSentinel2) matchCount += 4;
      if (mentionsLandsat) matchCount += 4;

      // Allow technical index queries if explicitly requested
      if ((q.includes('ndwi') || q.includes('ndvi')) && docLower.includes('ndwi')) matchCount += 2;
      if ((q.includes('spatial resolution') || q.includes('swath') || q.includes('revisit')) && docLower.includes('resolution')) matchCount += 2;

      // Only retain evidence chunks with explicit entity/spec match (matchCount >= 2)
      if (matchCount >= 2) {
        retrieved.push({
          ...doc,
          score: Math.min(0.98, parseFloat((0.80 + matchCount * 0.04).toFixed(2)))
        });
      }
    }

    // Sort descending by similarity score
    retrieved.sort((a, b) => b.score - a.score);
    return retrieved;
  }
}

