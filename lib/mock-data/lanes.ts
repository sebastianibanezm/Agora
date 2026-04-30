// Lane catalog for mock-data construction.
// POL is almost always a Chilean port; POD varies by destination market.
export const POL = {
  SAN_ANTONIO: { name: 'San Antonio, Chile', coords: [-71.6111, -33.5928] as [number, number] },
  VALPARAISO: { name: 'Valparaíso, Chile', coords: [-71.6127, -33.0472] as [number, number] },
  LIRQUEN: { name: 'Lirquén, Chile', coords: [-72.9839, -36.7156] as [number, number] },
  CORONEL: { name: 'Coronel, Chile', coords: [-73.1583, -37.0303] as [number, number] },
  IQUIQUE: { name: 'Iquique, Chile', coords: [-70.1530, -20.2208] as [number, number] },
};

export const POD = {
  CHARLESTON: { name: 'Charleston, USA', coords: [-79.9311, 32.7767] as [number, number] },
  SAVANNAH: { name: 'Savannah, USA', coords: [-81.0998, 32.0809] as [number, number] },
  LONG_BEACH: { name: 'Long Beach, USA', coords: [-118.1937, 33.7701] as [number, number] },
  ROTTERDAM: { name: 'Rotterdam, Netherlands', coords: [4.4777, 51.9244] as [number, number] },
  HAMBURG: { name: 'Hamburg, Germany', coords: [9.9937, 53.5511] as [number, number] },
  YANGSHAN: { name: 'Yangshan, China', coords: [122.0479, 30.6354] as [number, number] },
  SHANGHAI: { name: 'Shanghai, China', coords: [121.4737, 31.2304] as [number, number] },
  NHAVA_SHEVA: { name: 'Nhava Sheva, India', coords: [72.9484, 18.9486] as [number, number] },
  JEBEL_ALI: { name: 'Jebel Ali, UAE', coords: [55.0617, 24.9857] as [number, number] },
  CALLAO: { name: 'Callao, Peru', coords: [-77.1467, -12.0464] as [number, number] },
};
