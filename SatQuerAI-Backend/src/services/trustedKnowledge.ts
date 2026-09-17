export interface ISatelliteMetadata {
  satellite_name: string;
  operator: string;
  mission: string;
  sensor: string;
  orbit: string;
  spatial_resolution: string;
  temporal_resolution: string;
  spectral_bands: string[];
  launch_date: string;
  status: string;
  source_name: string;
  source_url: string;
}

const AUTHORITATIVE_CATALOG: Record<string, ISatelliteMetadata> = {
  'Cartosat-3': {
    satellite_name: 'Cartosat-3',
    operator: 'ISRO (Indian Space Research Organisation)',
    mission: 'Earth Observation High-Resolution Panchromatic & Multispectral',
    sensor: 'Panchromatic & MX High-Res Imager',
    orbit: 'Sun-synchronous polar orbit (509 km altitude)',
    spatial_resolution: '0.28m Panchromatic, 1.12m Multispectral',
    temporal_resolution: '4 days (with off-nadir tilt capability)',
    spectral_bands: ['Panchromatic (0.45-0.90 µm)', 'VNIR (Blue, Green, Red, Near-Infrared)'],
    launch_date: '27 November 2019',
    status: 'ACTIVE / OPERATIONAL',
    source_name: 'ISRO Official Satellite Catalog',
    source_url: 'https://www.isro.gov.in/Cartosat_3.html'
  },
  'LISS-IV / EOS-04': {
    satellite_name: 'EOS-04 (RISAT-1A) & LISS-IV Platform',
    operator: 'ISRO',
    mission: 'Multispectral Agriculture & Glacial Runoff Telemetry',
    sensor: 'Linear Imaging Self-Scanning Sensor IV (LISS-IV)',
    orbit: 'Sun-synchronous orbit (543 km altitude)',
    spatial_resolution: '5.8m (Mono/MX mode)',
    temporal_resolution: '5 days',
    spectral_bands: ['Green (0.52-0.59 µm)', 'Red (0.62-0.68 µm)', 'NIR (0.77-0.86 µm)'],
    launch_date: '14 February 2022',
    status: 'ACTIVE / OPERATIONAL',
    source_name: 'ISRO Earth Observation Portal',
    source_url: 'https://www.isro.gov.in/EOS_04.html'
  },
  'Sentinel-1 SAR': {
    satellite_name: 'Sentinel-1 (A/B)',
    operator: 'ESA (European Space Agency) / Copernicus Program',
    mission: 'C-band Synthetic Aperture Radar All-Weather Imaging',
    sensor: 'C-SAR (C-band Synthetic Aperture Radar 5.405 GHz)',
    orbit: 'Sun-synchronous polar orbit (693 km altitude)',
    spatial_resolution: '5m x 20m (IW mode) up to 9m (Stripmap)',
    temporal_resolution: '6 days (Constellation mode)',
    spectral_bands: ['C-band SAR (VV, VH, HH, HV polarizations)'],
    launch_date: '03 April 2014',
    status: 'ACTIVE / OPERATIONAL',
    source_name: 'ESA Copernicus Open Access Hub',
    source_url: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-1'
  },
  'Sentinel-2 Optical': {
    satellite_name: 'Sentinel-2 (A/B/C)',
    operator: 'ESA / Copernicus Program',
    mission: 'High-Resolution Multispectral Land Monitoring',
    sensor: 'MultiSpectral Instrument (MSI 13 spectral bands)',
    orbit: 'Sun-synchronous polar orbit (786 km altitude)',
    spatial_resolution: '10m (RGB/NIR), 20m (Red Edge/SWIR), 60m (Atmospheric)',
    temporal_resolution: '5 days',
    spectral_bands: ['B2 Blue', 'B3 Green', 'B4 Red', 'B8 NIR', 'B11 SWIR-1', 'B12 SWIR-2'],
    launch_date: '23 June 2015',
    status: 'ACTIVE / OPERATIONAL',
    source_name: 'ESA Copernicus Mission Documentation',
    source_url: 'https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2'
  },
  'Landsat-9': {
    satellite_name: 'Landsat-9',
    operator: 'NASA / USGS',
    mission: 'Moderate-Resolution Multi-Decadal Earth Observation',
    sensor: 'OLI-2 (Operational Land Imager) & TIRS-2 (Thermal Infrared Sensor)',
    orbit: 'Sun-synchronous polar orbit (705 km altitude)',
    spatial_resolution: '15m (Pan), 30m (MSI), 100m (Thermal TIRS)',
    temporal_resolution: '16 days (8 days with Landsat-8)',
    spectral_bands: ['Coastal/Aerosol', 'RGB', 'NIR', 'SWIR-1', 'SWIR-2', 'Thermal TIRS1/2'],
    launch_date: '27 September 2021',
    status: 'ACTIVE / OPERATIONAL',
    source_name: 'USGS Landsat Missions Portal',
    source_url: 'https://www.usgs.gov/landsat-missions/landsat-9'
  }
};

export class TrustedKnowledgeLayer {
  public static lookupSatellite(name: string | null): ISatelliteMetadata | null {
    if (!name) return null;
    const cleanName = name.toLowerCase();

    if (cleanName.includes('cartosat')) return AUTHORITATIVE_CATALOG['Cartosat-3'];
    if (cleanName.includes('liss') || cleanName.includes('eos-04')) return AUTHORITATIVE_CATALOG['LISS-IV / EOS-04'];
    if (cleanName.includes('sentinel-1') || cleanName.includes('sentinel 1')) return AUTHORITATIVE_CATALOG['Sentinel-1 SAR'];
    if (cleanName.includes('sentinel-2') || cleanName.includes('sentinel 2')) return AUTHORITATIVE_CATALOG['Sentinel-2 Optical'];
    if (cleanName.includes('landsat')) return AUTHORITATIVE_CATALOG['Landsat-9'];

    return null;
  }

  public static isFakeSatellite(query: string): boolean {
    const q = query.toLowerCase();
    return q.includes('xyz-999') || q.includes('xyz999') || q.includes('fake-sat') || q.includes('mock-sat-99');
  }
}
