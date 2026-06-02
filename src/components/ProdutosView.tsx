import React from 'react';
import { Calendar, CircleDot, Egg, Coffee, Award, Search, HelpCircle, MapPin, Anchor } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface ProdutosViewProps {
  activeTab?: 'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria';
  onTabChange?: (tab: 'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria') => void;
  siteSettings?: Record<string, string>;
}

export default function ProdutosView({ activeTab: propActiveTab, onTabChange, siteSettings }: ProdutosViewProps = {}) {
  const { language } = useLanguage();
  const [localTab, setLocalTab] = React.useState<'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria'>('avicultura');

  const activeTab = propActiveTab || localTab;
  const setActiveTab = (tab: 'avicultura' | 'citricultura' | 'cafeicultura' | 'agropecuaria') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalTab(tab);
    }
  };

  const [citrusSearch, setCitrusSearch] = React.useState('');

  const dict = {
    pt: {
      catalogue: 'Nosso Catálogo',
      title: 'Excelência em Cada Segmento do Campo',
      subtitle: 'Nossas frentes produtivas operam integrando ecossistema autossustentável e rígidos controles fitossanitários.',
      tabEgg: '🥚 Avicultura de Postura',
      tabCitrus: '🍊 Citricultura Técnica',
      tabCoffee: '☕ Cafeicultura Nobre',
      tabCattle: '🐂 Nelore Agropecuária',
      eggFarm: 'Fazenda Nova Aliança - Tatuí (SP)',
      eggTitle: 'Classificação e Nutrição Sob Medida',
      eggCommitment: 'Compromisso de Frescor:',
      eggCommitmentDesc: 'Graças à logística integrada com as nossas frotas, as entregas são feitas no mesmo dia da coleta para os principais centros de abastecimento paulistas.',
      eggBadge: 'Linhagem Premium',
      eggBadgeDesc: 'Tecnologia avançada de ovoscopia eletrônica controlada em Tatuí-SP com frescor absoluto no mesmo dia.',
      eggClassTitle: 'Nossa Classificação de Ovos',
      eggPhysics: 'Física: ',
      
      citrusSynergy: 'Sinergia de Solo: Tatuí SP & Burí SP',
      citrusTitle: 'Adubação Orgânica Aviária para Laranjas No Coração de SP',
      citrusEstimate: 'Estimativa de Campo:',
      citrusEstimateDesc: 'Nossos técnicos realizam exames de reteramento de frutos e análises climáticas sazonais de campo para obter a produtividade e datas exatas de doçura máxima antes da colheita seletiva manual.',
      citrusBadge: 'Pomares Sazonais',
      citrusBadgeTitle: 'Harvest do Ano Todo',
      citrusBadgeDesc: 'Laranjas e tangerinas polidas, nutridas puramente com o próprio adubo aviário da Fazenda.',
      citrusCalendar: 'Calendário de Safra (13 Variedades)',
      citrusFilter: 'Filtrar variedade ou mês...',
      citrusColVariety: 'Variedade Cítrica',
      citrusColHarvest: 'Período de Colheita',
      citrusColUse: 'Uso Principal',
      citrusColFeatures: 'Características de Sabor',
      citrusNoResults: 'Nenhuma variedade encontrada para',
      citrusTypeLabel: 'Tipo: ',

      coffeeAltitude: 'Itaí - São Paulo',
      coffeeTitle: 'Café Arábica de Altitude Invejável',
      coffeeBadge: 'Altitude Itaí',
      coffeeBadgeTitle: 'Café Arábica Seletivo',
      coffeeBadgeDesc: 'Grãos colhidos no zênite exato da maturação da cereja, com secagem lenta em terreiro ecológico.',
      coffeeSectionTitle: 'Nossas Variedades de Café Arábica',

      cattleAltitude: 'Santo Antônio do Leverger - MT',
      cattleTitle: 'Cria e Recria de Nelore com Máxima Dignidade',
      cattleCommitment: 'Fornecedores Locais MT:',
      cattleCommitmentDesc: 'Gerenciamos uma ampla rede de parceiros de recria no Mato Grosso, impulsionando a economia da microrregião pantaneira e garantindo origens idôneas do berço de bezerros Nelore.',
      cattleBadge: 'Santo Antônio do Leverger',
      cattleBadgeTitle: '4 Fazendas Modelo',
      cattleBadgeDesc: 'Rebanhos de cria e recria em pastos monitorados por veterinária contínua e imensa dignidade animal.',
      cattleSectionTitle: 'Nossas Unidades de Produção no Mato Grosso:',
    },
    en: {
      catalogue: 'Our Catalogue',
      title: 'Excellence in Every Field Segment',
      subtitle: 'Our productive fronts operate by integrating a self-sustaining ecosystem and strict phytosanitary controls.',
      tabEgg: '🥚 Poultry & Layer Eggs',
      tabCitrus: '🍊 Technical Citrus',
      tabCoffee: '☕ Noble Coffee',
      tabCattle: '🐂 Nelore Livestock',
      eggFarm: 'Nova Aliança Farm - Tatuí (SP)',
      eggTitle: 'Tailored Grading and Nutrition',
      eggCommitment: 'Freshness Commitment:',
      eggCommitmentDesc: 'Thanks to integrated logistics with our own fleets, deliveries are made on the same day of collection to the main supply centers of São Paulo.',
      eggBadge: 'Premium Lineage',
      eggBadgeDesc: 'Advanced electronic candling technology controlled in Tatuí-SP with absolute freshness on the same day.',
      eggClassTitle: 'Our Egg Classification',
      eggPhysics: 'Physics: ',

      citrusSynergy: 'Soil Synergy: Tatuí SP & Burí SP',
      citrusTitle: 'Organic Avian Fertilization for Oranges in the Heart of SP',
      citrusEstimate: 'Field Estimate:',
      citrusEstimateDesc: 'Our technicians perform fruit sampling exams and seasonal climatic field analyses to obtain exact yield and maximum sweetness dates before manual selective harvesting.',
      citrusBadge: 'Seasonal Orchards',
      citrusBadgeTitle: 'Year-Round Harvest',
      citrusBadgeDesc: 'Polished oranges and mandarins, nourished purely with the farm\'s own poultry manure.',
      citrusCalendar: 'Harvest Calendar (13 Varieties)',
      citrusFilter: 'Filter variety or month...',
      citrusColVariety: 'Citrus Variety',
      citrusColHarvest: 'Harvest Period',
      citrusColUse: 'Main Use',
      citrusColFeatures: 'Flavor Characteristics',
      citrusNoResults: 'No variety found for',
      citrusTypeLabel: 'Type: ',

      coffeeAltitude: 'Itaí - São Paulo',
      coffeeTitle: 'Enviable Altitude Arabica Coffee',
      coffeeBadge: 'Itaí Altitude',
      coffeeBadgeTitle: 'Selective Arabica Coffee',
      coffeeBadgeDesc: 'Beans harvested at the exact zenith of cherry ripeness, with slow drying on an ecological yard.',
      coffeeSectionTitle: 'Our Arabica Coffee Varieties',

      cattleAltitude: 'Santo Antônio do Leverger - MT',
      cattleTitle: 'Nelore Breeding and Rearing with Maximum Dignity',
      cattleCommitment: 'Local MT Providers:',
      cattleCommitmentDesc: 'We manage a broad network of rearing partners in Mato Grosso, boosting the economy of the Pantanal micro-region and guaranteeing trustworthy origins of the Nelore calf cradles.',
      cattleBadge: 'Santo Antônio do Leverger',
      cattleBadgeTitle: '4 Model Farms',
      cattleBadgeDesc: 'Breeding and rearing herds in pastures monitored by continuous veterinary care and immense animal dignity.',
      cattleSectionTitle: 'Our Production Units in Mato Grosso:',
    },
    es: {
      catalogue: 'Nuestro Catálogo',
      title: 'Excelencia en Cada Segmento del Campo',
      subtitle: 'Nuestras áreas productivas operan integrando un ecosistema autosostenible y estrictos controles fitosanitarios.',
      tabEgg: '🥚 Avicultura de Postura',
      tabCitrus: '🍊 Citricultura Técnica',
      tabCoffee: '☕ Caficultura Noble',
      tabCattle: '🐂 Ganadería Nelore',
      eggFarm: 'Hacienda Nova Aliança - Tatuí (SP)',
      eggTitle: 'Clasificación y Nutrición a Medida',
      eggCommitment: 'Compromiso de Frescura:',
      eggCommitmentDesc: 'Gracias a la logística integrada con nuestras flotas, las entregas se realizan el mismo día de la recolección para los principales centros de suministro de São Paulo.',
      eggBadge: 'Linaje Premium',
      eggBadgeDesc: 'Tecnología avanzada de ovoscopia electrónica controlada en Tatuí-SP con frescura absoluta en el mismo día.',
      eggClassTitle: 'Nuestra Clasificación de Huevos',
      eggPhysics: 'Física: ',

      citrusSynergy: 'Sinergia del Suelo: Tatuí SP & Burí SP',
      citrusTitle: 'Abonado Orgánico Avícola para Naranjas en el Corazón de SP',
      citrusEstimate: 'Estimación de Campo:',
      citrusEstimateDesc: 'Nuestros técnicos realizan muestreos de frutos y análisis climáticos estacionales de campo para obtener el rendimiento exacto y las fechas de máxima dulzura antes de la cosecha selectiva manual.',
      citrusBadge: 'Huertos Estacionales',
      citrusBadgeTitle: 'Cosecha de Todo el Año',
      citrusBadgeDesc: 'Naranjas y mandarinas pulidas, nutridas puramente con el propio abono avícola de la hacienda.',
      citrusCalendar: 'Calendario de Cosecha (13 Variedades)',
      citrusFilter: 'Filtrar variedad o mes...',
      citrusColVariety: 'Variedad de Cítricos',
      citrusColHarvest: 'Período de Cosecha',
      citrusColUse: 'Uso Principal',
      citrusColFeatures: 'Características de Sabor',
      citrusNoResults: 'Ninguna variedad encontrada para',
      citrusTypeLabel: 'Tipo: ',

      coffeeAltitude: 'Itaí - São Paulo',
      coffeeTitle: 'Café Arábica de Altitud Envidiable',
      coffeeBadge: 'Altitud de Itaí',
      coffeeBadgeTitle: 'Café Arábica Selecto',
      coffeeBadgeDesc: 'Granos cosechados en el cénit exacto de la maduración de la cereza, con secado lento en un patio ecológico.',
      coffeeSectionTitle: 'Nuestras Variedades de Café Arábica',

      cattleAltitude: 'Santo Antônio del Leverger - MT',
      cattleTitle: 'Cría y Recría de Nelore con la Máxima Dignidad',
      cattleCommitment: 'Proveedores Locales de MT:',
      cattleCommitmentDesc: 'Gestionamos una amplia red de socios criadores en Mato Grosso, impulsando la economía de la microrregión del Pantanal y garantizando orígenes confiables de los terneros Nelore.',
      cattleBadge: 'Santo Antônio del Leverger',
      cattleBadgeTitle: '4 Haciendas Modelo',
      cattleBadgeDesc: 'Rebaños de cría y recría en pastos monitoreados por cuidado veterinario continuo e inmensa dignidad animal.',
      cattleSectionTitle: 'Nuestras Unidades de Producción en Mato Grosso:',
    }
  };

  const tView = dict[language] || dict['pt'];

  const localizedEggTypes = {
    pt: [
      { code: 'SE', name: 'Tipo Super Extra (Jumbo)', desc: 'O maior calibre produzido em nossos galpões de postura. Seleção premium para receitas que demandam alto rendimento de gema.', weight: 'Média de +66g por unidade', shell: 'Casca super espessa, branca ou vermelha.' },
      { code: 'E', name: 'Tipo Extra', desc: 'Classificação excelente para revenda final e mercados gourmet. Embalados sob rigoroso controle de estanque.', weight: 'Média de 60g a 65g por unidade', shell: 'Casca uniforme e textura lisa.' },
      { code: 'A', name: 'Tipo Grande', desc: 'O campeão de vendas nas gôndolas de todo o Brasil. Inteiramente higienizado e inspecionado eletronicamente.', weight: 'Média de 55g a 59g por unidade', shell: 'Casca extremamente firme.' },
      { code: 'B', name: 'Tipo Médio', desc: 'Excelente custo-benefício para panificadoras e confeitarias regulares que exigem padrão constante.', weight: 'Média de 50g a 54g por unidade', shell: 'Visual intacto.' },
      { code: 'C', name: 'Tipo Pequeno', desc: 'Ovos de poedeiras jovens, ideais para consumo rápido domesticamente ou conservas específicas.', weight: 'Média de 45g a 49g por unidade', shell: 'Alta densidade de clara.' },
      { code: 'D', name: 'Tipo Industrial', desc: 'Exclusivo para processamento fabril e pasteurização líquida/desidratada por indústrias alimentícias.', weight: 'Abaixo de 45g por unidade', shell: 'Destinados à quebra mecanizada industrial.' }
    ],
    en: [
      { code: 'SE', name: 'Super Extra Type (Jumbo)', desc: 'The largest caliber produced in our laying houses. Premium selection for recipes requiring high yolk yield.', weight: 'Average of +66g per unit', shell: 'Super thick shell, white or brown.' },
      { code: 'E', name: 'Extra Type', desc: 'Excellent grading for retail and gourmet markets. Packed under strict seal control.', weight: 'Average of 60g to 65g per unit', shell: 'Uniform shell and smooth texture.' },
      { code: 'A', name: 'Large Type', desc: 'The best seller on supermarket shelves across Brazil. Entirely sanitized and electronically inspected.', weight: 'Average of 55g to 59g per unit', shell: 'Extremely firm shell.' },
      { code: 'B', name: 'Medium Type', desc: 'Excellent cost-benefit ratio for regular bakeries and confectioneries requiring constant standards.', weight: 'Average of 50g to 54g per unit', shell: 'Intact appearance.' },
      { code: 'C', name: 'Small Type', desc: 'Eggs from young hens, ideal for quick domestic consumption or specific preserves.', weight: 'Average of 45g to 49g per unit', shell: 'High white density.' },
      { code: 'D', name: 'Industrial Type', desc: 'Exclusive for factory processing and liquid/dehydrated pasteurization by food industries.', weight: 'Below 45g per unit', shell: 'Intended for industrial mechanized breaking.' }
    ],
    es: [
      { code: 'SE', name: 'Tipo Súper Extra (Jumbo)', desc: 'El mayor calibre producido en nuestros galpones de postura. Selección premium para recetas que demandan alto rendimiento de yema.', weight: 'Promedio de +66g por unidad', shell: 'Cascara súper gruesa, blanca o roja.' },
      { code: 'E', name: 'Tipo Extra', desc: 'Clasificación excelente para la venta final y mercados gourmet. Envasados bajo estricto control de estanqueidad.', weight: 'Promedio de 60g a 65g por unidad', shell: 'Cascara uniforme y textura lisa.' },
      { code: 'A', name: 'Tipo Grande', desc: 'El más vendido en las góndolas de todo el Brasil. Completamente higienizado e inspeccionado electrónicamente.', weight: 'Promedio de 55g a 59g por unidad', shell: 'Cascara extremadamente firme.' },
      { code: 'B', name: 'Tipo Medio', desc: 'Excelente relación costo-beneficio para panaderías y confiterías regulares que requieren un estándar constante.', weight: 'Promedio de 50g a 54g por unidad', shell: 'Aspecto intacto.' },
      { code: 'C', name: 'Tipo Pequeño', desc: 'Huevos de gallinas jóvenes, ideales para consumo rápido doméstico o conservas específicas.', weight: 'Promedio de 45g a 49g por unidad', shell: 'Alta densidad de clara.' },
      { code: 'D', name: 'Tipo Industrial', desc: 'Exclusivo para procesamiento industrial y pasteurización líquida/deshidratada de industrias alimentarias.', weight: 'Menos de 45g por unidad', shell: 'Destinados a la rotura mecanizada industrial.' }
    ]
  };

  const localizedCitrusVarieties = {
    pt: [
      { name: 'Tangerina Ponkan', months: 'Abril a Julho', type: 'Mesa', desc: 'Sabor altamente doce, fácil de descascar e com gomos repletos de caldo.' },
      { name: 'Laranja Folha Murcha', months: 'Fevereiro a Março', type: 'Mesa / Suco', desc: 'Excelente rendimento de suco ácido e adocicado na medida perfeita.' },
      { name: 'Laranja Lima Rafael', months: 'Abril a Julho', type: 'Baixa acidez (Lima)', desc: 'Ideal para crianças e pessoas com sensibilidade estomacal devido à acidez quase zero.' },
      { name: 'Laranja Bahia', months: 'Abril a Julho', type: 'Mesa', desc: 'Muito saborosa, conhecida pelo "umbigo" na extremidade, fácil de degustar e sem sementes.' },
      { name: 'Tangerina Murcote', months: 'Agosto a Dezembro', type: 'Mesa / Suco', desc: 'Híbrido vigoroso, casca firme e brilhante, excelente conservação pós-colheita.' },
      { name: 'Laranja Rubi', months: 'Junho a Julho', type: 'Suco', desc: 'Suco com coloração tipicamente avermelhada/alaranjada intensa e alto teor de frutose.' },
      { name: 'Laranja Lima Verde', months: 'Agosto a Novembro', type: 'Baixa acidez', desc: 'Muito refrescante, cultivada com fertilizantes de esterco para acentuar a doçura natural.' },
      { name: 'Laranja Hamilim', months: 'Maio a Junho', type: 'Precoce / Suco', desc: 'Fruta precoce de casca fina, muito rendimento de líquido límpido.' },
      { name: 'Laranja Pêra Coroa', months: 'Setembro a Novembro', type: 'Mesa / Industrial', desc: 'Espécie tradicional de grande aceitação, tamanho ideal para ensacamento comercial.' },
      { name: 'Laranja Charmute', months: 'Janeiro a Fevereiro', type: 'Suco', desc: 'Colheita focada no início do ano para abastecer distribuidoras durante a entressafra geral.' },
      { name: 'Laranja Valência', months: 'Novembro a Dezembro', type: 'Industrial / Suco', desc: 'A variedade mais plantada para exportação devido à estabilidade térmica do suco concentrado.' },
      { name: 'Laranja Westin', months: 'Junho a Julho', type: 'Precoce', desc: 'Polpa macia de maturação adiantada, excelente para consumo in natura imediato.' },
      { name: 'Laranja Pêra Natal', months: 'Janeiro a Março', type: 'Tardia / Suco', desc: 'Excelente resistência no pé durante as semanas quentes de verão.' }
    ],
    en: [
      { name: 'Ponkan Mandarin', months: 'April to July', type: 'Table', desc: 'Highly sweet flavor, easy to peel and with wedge-heavy segments full of juice.' },
      { name: 'Folha Murcha Orange', months: 'February to March', type: 'Table / Juice', desc: 'Excellent yield of acidic and perfectly sweetened juice.' },
      { name: 'Lima Rafael Orange', months: 'April to July', type: 'Low Acidity (Lima)', desc: 'Ideal for children and people with stomach sensitivity due to near-zero acidity.' },
      { name: 'Bahia Orange', months: 'April to July', type: 'Table', desc: 'Very tasty, known for the "navel" at the end, easy to enjoy and seedless.' },
      { name: 'Murcote Mandarin', months: 'August to December', type: 'Table / Juice', desc: 'Vigorous hybrid, firm and shiny peel, excellent post-harvest conservation.' },
      { name: 'Rubi Orange', months: 'June to July', type: 'Juice', desc: 'Juice with typical intense reddish-orange color and high fructose content.' },
      { name: 'Lima Verde Orange', months: 'August to November', type: 'Low Acidity', desc: 'Very refreshing, cultivated with manure fertilizer to accent natural sweetness.' },
      { name: 'Hamilim Orange', months: 'May to June', type: 'Early / Juice', desc: 'Early fruit with thin skin and rich clear juice yield.' },
      { name: 'Pêra Coroa Orange', months: 'September to November', type: 'Table / Industrial', desc: 'Traditional, widely accepted species, ideal size for commercial bagging.' },
      { name: 'Charmute Orange', months: 'January to February', type: 'Juice', desc: 'Harvesting focused on the beginning of the year to supply distributors during off-season.' },
      { name: 'Valencia Orange', months: 'November to December', type: 'Industrial / Juice', desc: 'The most planted export variety due to the thermal stability of concentrated juice.' },
      { name: 'Westin Orange', months: 'June to July', type: 'Early', desc: 'Soft pulp with early ripening, excellent for immediate fresh consumption.' },
      { name: 'Pêra Natal Orange', months: 'January to March', type: 'Late / Juice', desc: 'Excellent resistance on the tree during hot summer weeks.' }
    ],
    es: [
      { name: 'Tangerina Ponkan', months: 'Abril a Julio', type: 'Mesa', desc: 'Sabor muy dulce, fácil de pelar y con gajos repletos de jugo.' },
      { name: 'Naranja Folha Murcha', months: 'Febrero a Marzo', type: 'Mesa / Jugo', desc: 'Excelente rendimiento de jugo ácido y dulce en la medida perfecta.' },
      { name: 'Naranja Lima Rafael', months: 'Abril a Julio', type: 'Baja acidez (Lima)', desc: 'Ideal para niños y personas con sensibilidad estomacal debido a la acidez casi nula.' },
      { name: 'Naranja Bahia', months: 'Abril a Julio', type: 'Mesa', desc: 'Muy sabrosa, conocida por el "ombligo" en el extremo, fácil de degustar y sin semillas.' },
      { name: 'Tangerina Murcote', months: 'Agosto a Diciembre', type: 'Mesa / Jugo', desc: 'Híbrido vigoroso, cáscara firme y brillante, excelente conservación postcosecha.' },
      { name: 'Naranja Rubi', months: 'Junio a Julio', type: 'Jugo', desc: 'Jugo con color típicamente rojizo/anaranjado intenso y alto contenido de fructosa.' },
      { name: 'Naranja Lima Verde', months: 'Agosto a Noviembre', type: 'Baja acidez', desc: 'Muy refrescante, cultivada con fertilizantes de estiércol para acentuar el dulzor natural.' },
      { name: 'Naranja Hamilim', months: 'Mayo a Junio', type: 'Precoz / Jugo', desc: 'Fruta precoz de cáscara fina, excelente rendimiento de líquido claro.' },
      { name: 'Naranja Pêra Coroa', months: 'Septiembre a Noviembre', type: 'Mesa / Industrial', desc: 'Especie tradicional de gran aceptación, tamaño ideal para embolsado comercial.' },
      { name: 'Naranja Charmute', months: 'Enero a Febrero', type: 'Jugo', desc: 'Cosecha enfocada a principios de año para abastecer a distribidoras durante la temporada baja.' },
      { name: 'Naranja Valencia', months: 'Noviembre a Diciembre', type: 'Industrial / Jugo', desc: 'La variedad más plantada para exportación debido a la estabilidad térmica de su jugo concentrado.' },
      { name: 'Naranja Westin', months: 'Junio a Julio', type: 'Precoz', desc: 'Pulpa suave con maduración temprana, excelente para el consumo fresco inmediato.' },
      { name: 'Naranja Pêra Natal', months: 'Enero a Marzo', type: 'Tardía / Jugo', desc: 'Excelente resistencia en el árbol durante las calurosas semanas de verano.' }
    ]
  };

  const localizedCoffeeVarieties = {
    pt: [
      { name: 'Mundo Novo', desc: 'Resultante da hibridização natural, muito vigorosa com alta acidez equilibrada e notas achocolatadas.' },
      { name: 'Catuaí', desc: 'Porte baixo de fácil manejo que retém o fruto por mais tempo, gerando doçura intensa e corpo cremoso.' },
      { name: 'Tupi', desc: 'Altíssima resistência a pragas, bebida limpa, acidez cítrica moderada e aroma floral persistente.' },
      { name: 'Ouro Verde', desc: 'Bebida extremamente encorpada com notas sutis de avelã, ideal para apreciadores de espressos clássicos.' },
      { name: 'Topázio', desc: 'Sabor de caramelo marcante, acidez equilibrada e doçura pronunciada de processamento natural.' },
      { name: 'Catucaí', desc: 'Crossover com excelente resistência a geadas, aroma caramelizado e finalização limpa e refrescante.' }
    ],
    en: [
      { name: 'Mundo Novo', desc: 'Resulting from natural hybridization, highly vigorous with high balanced acidity and chocolatey notes.' },
      { name: 'Catuaí', desc: 'Low stature, easy-to-manage plant that retains fruit longer, generating intense sweetness and creamy body.' },
      { name: 'Tupi', desc: 'Extremely high resistance to pests, clean beverage with moderate citrus acidity and persistent floral aroma.' },
      { name: 'Ouro Verde', desc: 'Extremely full-bodied beverage with subtle notes of hazelnut, ideal for classic espresso lovers.' },
      { name: 'Topázio', desc: 'Striking caramel flavor, balanced acidity and pronounced sweetness from natural processing.' },
      { name: 'Catucaí', desc: 'Crossover with excellent frost resistance, caramelized aroma, and clean, refreshing finish.' }
    ],
    es: [
      { name: 'Mundo Novo', desc: 'Resultado de la hibridización natural, muy vigorosa con alta acidez equilibrada y notas de chocolate.' },
      { name: 'Catuaí', desc: 'Porte bajo de fácil manejo que retiene el fruto por más tiempo, generando dulzor intenso y cuerpo cremoso.' },
      { name: 'Tupi', desc: 'Altísima resistencia a plagas, bebida limpia, acidez cítrica moderada y aroma floral de larga duración.' },
      { name: 'Ouro Verde', desc: 'Bebida de gran cuerpo con notas sutiles de avellana, ideal para los amantes del espresso clásico.' },
      { name: 'Topázio', desc: 'Sabor a caramelo llamativo, acidez equilibrada y dulzor pronunciado del procesamiento natural.' },
      { name: 'Catucaí', desc: 'Cruze con excelente resistencia a las heladas, aroma caramelizado y final de taza limpio y refrescante.' }
    ]
  };

  const localizedMTFazendas = {
    pt: [
      { name: 'Fazenda Vitória São Lourenço', role: 'Cria e Recria de Bezerros Nelore', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Estrela do Oeste', role: 'Engorda e Alimentação Controlada', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Boa Esperança', role: 'Melhoramento Genético de Touros', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Vale do Mutum', role: 'Pastagens de Lactação e Recria', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' }
    ],
    en: [
      { name: 'Fazenda Vitória São Lourenço', role: 'Breeding and Rearing of Nelore Calves', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Estrela do Oeste', role: 'Fattening and Controlled Feeding', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Boa Esperança', role: 'Sires Genetic Improvement', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Vale do Mutum', role: 'Lactation and Rearing Pastures', city: 'Santo Antônio do Leverger - MT', phone: '(15) 3259-9710' }
    ],
    es: [
      { name: 'Fazenda Vitória São Lourenço', role: 'Cría y Recría de Terneros Nelore', city: 'Santo Antônio del Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Estrela do Oeste', role: 'Engorde y Alimentación Controlada', city: 'Santo Antônio del Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Boa Esperança', role: 'Mejoramiento Genético de Toros', city: 'Santo Antônio del Leverger - MT', phone: '(15) 3259-9710' },
      { name: 'Fazenda Vale do Mutum', role: 'Pastizales de Lactancia y Recría', city: 'Santo Antônio del Leverger - MT', phone: '(15) 3259-9710' }
    ]
  };

  const eggTypes = localizedEggTypes[language] || localizedEggTypes['pt'];
  const citrusVarieties = localizedCitrusVarieties[language] || localizedCitrusVarieties['pt'];
  const coffeeVarieties = localizedCoffeeVarieties[language] || localizedCoffeeVarieties['pt'];
  const MTFazendas = localizedMTFazendas[language] || localizedMTFazendas['pt'];

  const filteredCitrus = citrusVarieties.filter(v =>
    v.name.toLowerCase().includes(citrusSearch.toLowerCase()) ||
    v.months.toLowerCase().includes(citrusSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-xs font-bold text-amber-600 tracking-widest uppercase font-mono">{tView.catalogue}</h2>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          {tView.title}
        </h1>
        <p className="text-slate-500 text-sm mt-2">{tView.subtitle}</p>
        <div className="w-20 h-1.5 bg-emerald-800 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-slate-150 pb-4">
        {[
          { key: 'avicultura', label: tView.tabEgg, bg: 'hover:text-amber-700 hover:bg-amber-50', activeBg: 'bg-amber-500 text-white border-amber-500 shadow-md' },
          { key: 'citricultura', label: tView.tabCitrus, bg: 'hover:text-emerald-700 hover:bg-emerald-50', activeBg: 'bg-emerald-750 text-white border-emerald-700 shadow-md' },
          { key: 'cafeicultura', label: tView.tabCoffee, bg: 'hover:text-[#8B5A2B] hover:bg-amber-100/40', activeBg: 'bg-[#8B5A2B] text-white border-[#704214] shadow-md' },
          { key: 'agropecuaria', label: tView.tabCattle, bg: 'hover:text-emerald-900 hover:bg-slate-100', activeBg: 'bg-emerald-950 text-white border-emerald-950 shadow-md' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab.key ? tab.activeBg : `bg-white text-slate-700 ${tab.bg}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rendered active tab panel */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-10 shadow-xs">
        
        {/* TAB 1: AVICULTURA */}
        {activeTab === 'avicultura' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-150 pb-8">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold bg-amber-105 text-amber-900 border border-amber-200 px-3 py-1 rounded-md uppercase font-mono">
                  {tView.eggFarm}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {tView.eggTitle}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {siteSettings?.prod_avicultura_desc || 'Na Fazenda Nova Aliança, o cuidado começa na linhagem das poedeiras e se estende até as modernas esteiras de pesagem eletrônica automatizada. Produzimos 06 tipos comerciais de ovos, acondicionados delicadamente para transporte rápido com máxima proteção e frescor incomparável.'}
                </p>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
                  💡 <strong>{tView.eggCommitment}</strong> {tView.eggCommitmentDesc}
                </div>
              </div>
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-amber-200 shadow-xs h-64 group image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80"
                  alt="Avicultura Shigueno"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="inline-flex items-center space-x-1.5 self-start bg-amber-500/95 text-slate-950 font-black px-2.5 py-1 rounded text-[10px] uppercase mb-1.5">
                    <Egg className="w-3.5 h-3.5" />
                    <span>{tView.eggBadge}</span>
                  </div>
                  <h4 className="font-black text-sm text-amber-300 drop-shadow">Fazenda Nova Aliança</h4>
                  <p className="text-[11px] text-amber-100/95 leading-relaxed font-medium">{tView.eggBadgeDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-950 flex items-center">
                <CircleDot className="w-4 h-4 mr-2 text-amber-500" />
                {tView.eggClassTitle}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eggTypes.map((egg, i) => (
                  <div key={i} className="border border-slate-150 rounded-xl p-5 hover:border-amber-400 hover:shadow-xs transition-colors bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black bg-amber-500 text-white px-2.5 py-1 rounded-md font-mono">{egg.code}</span>
                      <span className="text-[11px] text-emerald-800 font-mono font-bold uppercase">{egg.weight}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-sm">{egg.name}</h5>
                    <p className="text-xs text-slate-650 leading-relaxed mt-2">{egg.desc}</p>
                    <p className="text-[10px] text-slate-450 italic mt-2.5">{tView.eggPhysics}{egg.shell}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CITRICULTURA */}
        {activeTab === 'citricultura' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-slate-150 pb-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-250 px-3 py-1 rounded-md uppercase font-mono">
                  {tView.citrusSynergy}
                </span>
                <h3 className="text-2xl font-black text-emerald-950">
                  {tView.citrusTitle}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {siteSettings?.prod_citricultura_desc || 'A Fazenda Nova Aliança (Tatuí-SP) e a Fazenda Califórnia (Burí-SP) produzem laranjas doces excepcionais para suco e mesa. Usamos o adubo orgânico das próprias galinhas para fertilizar os pomares, conferindo um sabor indescritivelmente doce, baixa acidez de polpa e sustentabilidade exemplar ao ecossistema.'}
                </p>
                <p className="text-xs text-slate-500">
                  ✓ <strong>{tView.citrusEstimate}</strong> {tView.citrusEstimateDesc}
                </p>
              </div>
              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-emerald-200 shadow-xs h-64 group image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80"
                  alt="Citricultura Shigueno"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="inline-flex items-center space-x-1.5 self-start bg-emerald-700 text-white font-black px-2.5 py-1 rounded text-[10px] uppercase mb-1.5">
                    <Calendar className="w-3.5 h-3.5 hover:scale-110 transition-transform" />
                    <span>{tView.citrusBadge}</span>
                  </div>
                  <h4 className="font-black text-sm text-amber-300 drop-shadow">{tView.citrusBadgeTitle}</h4>
                  <p className="text-[11px] text-emerald-100/95 leading-relaxed font-medium">{tView.citrusBadgeDesc}</p>
                </div>
              </div>
            </div>

            {/* Calendar Table Search */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="text-lg font-bold text-slate-950">{tView.citrusCalendar}</h4>
                <div className="relative max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder={tView.citrusFilter}
                    value={citrusSearch}
                    onChange={(e) => setCitrusSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs w-full focus:outline-emerald-800"
                  />
                </div>
              </div>

              {/* Responsive Citrus Varieties View */}
              <div className="hidden md:block overflow-x-auto border border-slate-150 rounded-2xl shadow-xs">
                <table className="min-w-full divide-y divide-slate-150 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="px-6 py-4">{tView.citrusColVariety}</th>
                      <th className="px-6 py-4">{tView.citrusColHarvest}</th>
                      <th className="px-6 py-4">{tView.citrusColUse}</th>
                      <th className="px-6 py-4">{tView.citrusColFeatures}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-sans text-slate-700">
                    {filteredCitrus.length > 0 ? (
                      filteredCitrus.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-900">{v.name}</td>
                          <td className="px-6 py-3.5">
                            <span className="inline-block px-3 py-1 bg-amber-50 rounded-full text-amber-850 font-bold text-xs border border-amber-200">
                              {v.months}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-emerald-800">{v.type}</td>
                          <td className="px-6 py-3.5 text-xs text-slate-650">{v.desc}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs italic">
                          {tView.citrusNoResults} "{citrusSearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Mobile Friendly List (Hidden on desktop) */}
              <div className="block md:hidden space-y-4">
                {filteredCitrus.length > 0 ? (
                  filteredCitrus.map((v, i) => (
                    <div key={i} className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-extrabold text-slate-900 text-sm leading-tight">{v.name}</h5>
                        <span className="shrink-0 inline-block px-2.5 py-0.5 bg-amber-50 rounded-full text-amber-850 font-bold text-[10px] border border-amber-200">
                          {v.months}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide text-[9px]">
                          {tView.citrusTypeLabel}{v.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed">{v.desc}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-xs italic py-6">
                    {tView.citrusNoResults} "{citrusSearch}".
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAFEICULTURA */}
        {activeTab === 'cafeicultura' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-150 pb-8">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold bg-[#8B5A2B]/10 text-[#8B5A2B] border border-[#8B5A2B]/30 px-3 py-1 rounded-md uppercase font-mono">
                  {tView.coffeeAltitude}
                </span>
                <h3 className="text-2xl font-black text-[#5C3A1A]">
                  {tView.coffeeTitle}
                </h3>
                <p className="text-slate-650 text-sm leading-relaxed">
                  {siteSettings?.prod_cafeicultura_desc || 'Operamos em Itaí (SP) com as conceituadas fazendas Nova Esperança, Novo Horizonte e Bela Vista. Aliando solos profundos e microclima serrano ideal, colhemos grãos 100% Arábica de maturação lenta com propriedades organolépticas excepcionais, conferindo notas persistentes à bebida final.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-mono text-xs font-bold rounded">Fazenda Nova Esperança</span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-mono text-xs font-bold rounded">Fazenda Novo Horizonte</span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-mono text-xs font-bold rounded">Fazenda Bela Vista</span>
                </div>
              </div>
              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-amber-300 shadow-xs h-64 group image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                  alt="Cafeicultura Shigueno"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="inline-flex items-center space-x-1.5 self-start bg-[#8B5A2B] text-white font-black px-2.5 py-1 rounded text-[10px] uppercase mb-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{tView.coffeeBadge}</span>
                  </div>
                  <h4 className="font-black text-sm text-amber-300 drop-shadow">{tView.coffeeBadgeTitle}</h4>
                  <p className="text-[11px] text-amber-100/95 leading-relaxed font-medium">{tView.coffeeBadgeDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center">
                <Award className="w-4 h-4 mr-2 text-amber-600" />
                {tView.coffeeSectionTitle}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coffeeVarieties.map((item, i) => (
                  <div key={i} className="border border-slate-150 bg-slate-50/50 p-5 rounded-2xl relative overflow-hidden group hover:border-[#8B5A2B] transition-colors">
                    <h5 className="font-extrabold text-slate-900 text-base">{item.name}</h5>
                    <p className="text-xs text-slate-650 mt-2.5 leading-relaxed">{item.desc}</p>
                    <span className="absolute bottom-1 right-2 text-3xl font-bold text-amber-100/40 select-none font-mono">0{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AGROPECUARIA */}
        {activeTab === 'agropecuaria' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-150 pb-8">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold bg-emerald-950 text-emerald-100 px-3 py-1 rounded-md uppercase font-mono">
                  {tView.cattleAltitude}
                </span>
                <h3 className="text-2xl font-black text-slate-950">
                  {tView.cattleTitle}
                </h3>
                <p className="text-slate-650 text-sm leading-relaxed font-sans">
                  {siteSettings?.prod_nelore_desc || 'No estado de Mato Grosso, mantemos a tradição pecuária nos limites de Santo Antônio do Leverger. Nosso rebanho da raça Nelore é acompanhado por corpo veterinário contínuo, focado em manejo gentil racional, suplementação mineral em pasto rotacionado e rigoroso calendário de imunização contra epizootias.'}
                </p>
                <div className="bg-emerald-50 text-emerald-950 p-4 rounded-xl border border-emerald-100 text-xs">
                  🤝 <strong>{tView.cattleCommitment}</strong> {tView.cattleCommitmentDesc}
                </div>
              </div>
              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-emerald-300 shadow-xs h-64 group image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80"
                  alt="Nelore Shigueno"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="inline-flex items-center space-x-1.5 self-start bg-emerald-800 text-white font-black px-2.5 py-1 rounded text-[10px] uppercase mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tView.cattleBadge}</span>
                  </div>
                  <h4 className="font-black text-sm text-yellow-300 drop-shadow">{tView.cattleBadgeTitle}</h4>
                  <p className="text-[11px] text-emerald-100/95 leading-relaxed font-medium">{tView.cattleBadgeDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">{tView.cattleSectionTitle}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MTFazendas.map((faz, idx) => (
                  <div key={idx} className="border border-slate-150 rounded-2xl p-5 bg-[#fafbfa] flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">{faz.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{faz.role}</p>
                      <p className="text-xs text-emerald-800 font-semibold">{faz.city}</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg shadow-xs border text-slate-600 block shrink-0">{faz.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
