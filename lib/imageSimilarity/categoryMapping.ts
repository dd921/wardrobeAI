export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Dresses'
  | 'Shoes'
  | 'Accessories'
  | 'Activewear'
  | 'Swimwear'
  | 'Sleepwear'
  | 'Other';

/**
 * Maps ImageNet class keywords to wardrobe categories
 * Keywords are checked against the lowercase class name
 */
export const CATEGORY_KEYWORDS: Record<string, ClothingCategory> = {
  // Tops
  'jersey': 'Tops',
  'shirt': 'Tops',
  'polo': 'Tops',
  'sweater': 'Tops',
  'cardigan': 'Tops',
  'sweatshirt': 'Tops',
  'tank': 'Tops',
  'blouse': 'Tops',
  'tee': 'Tops',
  't-shirt': 'Tops',
  'tshirt': 'Tops',
  'top': 'Tops',
  'hoodie': 'Tops',
  'pullover': 'Tops',
  'vest': 'Tops',
  'halter': 'Tops',
  'crop': 'Tops',
  'tunic': 'Tops',
  'camisole': 'Tops',

  // Bottoms
  'jean': 'Bottoms',
  'jeans': 'Bottoms',
  'pants': 'Bottoms',
  'trouser': 'Bottoms',
  'trousers': 'Bottoms',
  'shorts': 'Bottoms',
  'skirt': 'Bottoms',
  'legging': 'Bottoms',
  'leggings': 'Bottoms',
  'chino': 'Bottoms',
  'khaki': 'Bottoms',
  'jogger': 'Bottoms',
  'joggers': 'Bottoms',
  'sweatpants': 'Bottoms',
  'culottes': 'Bottoms',

  // Outerwear
  'coat': 'Outerwear',
  'jacket': 'Outerwear',
  'blazer': 'Outerwear',
  'parka': 'Outerwear',
  'windbreaker': 'Outerwear',
  'raincoat': 'Outerwear',
  'trench': 'Outerwear',
  'overcoat': 'Outerwear',
  'bomber': 'Outerwear',
  'denim jacket': 'Outerwear',
  'leather jacket': 'Outerwear',
  'puffer': 'Outerwear',
  'anorak': 'Outerwear',
  'peacoat': 'Outerwear',
  'cape': 'Outerwear',
  'poncho': 'Outerwear',

  // Dresses
  'dress': 'Dresses',
  'gown': 'Dresses',
  'sundress': 'Dresses',
  'maxi': 'Dresses',
  'midi': 'Dresses',
  'mini dress': 'Dresses',
  'romper': 'Dresses',
  'jumpsuit': 'Dresses',
  'playsuit': 'Dresses',
  'overalls': 'Dresses',

  // Shoes
  'shoe': 'Shoes',
  'shoes': 'Shoes',
  'sneaker': 'Shoes',
  'sneakers': 'Shoes',
  'boot': 'Shoes',
  'boots': 'Shoes',
  'loafer': 'Shoes',
  'loafers': 'Shoes',
  'sandal': 'Shoes',
  'sandals': 'Shoes',
  'heel': 'Shoes',
  'heels': 'Shoes',
  'pump': 'Shoes',
  'pumps': 'Shoes',
  'flat': 'Shoes',
  'flats': 'Shoes',
  'oxford': 'Shoes',
  'oxfords': 'Shoes',
  'running shoe': 'Shoes',
  'tennis shoe': 'Shoes',
  'athletic shoe': 'Shoes',
  'slipper': 'Shoes',
  'slippers': 'Shoes',
  'moccasin': 'Shoes',
  'espadrille': 'Shoes',
  'clog': 'Shoes',
  'clogs': 'Shoes',
  'wedge': 'Shoes',
  'mule': 'Shoes',
  'stiletto': 'Shoes',

  // Accessories
  'hat': 'Accessories',
  'cap': 'Accessories',
  'beanie': 'Accessories',
  'scarf': 'Accessories',
  'bag': 'Accessories',
  'handbag': 'Accessories',
  'purse': 'Accessories',
  'backpack': 'Accessories',
  'wallet': 'Accessories',
  'belt': 'Accessories',
  'tie': 'Accessories',
  'bow tie': 'Accessories',
  'bowtie': 'Accessories',
  'watch': 'Accessories',
  'bracelet': 'Accessories',
  'necklace': 'Accessories',
  'ring': 'Accessories',
  'earring': 'Accessories',
  'earrings': 'Accessories',
  'glasses': 'Accessories',
  'sunglasses': 'Accessories',
  'glove': 'Accessories',
  'gloves': 'Accessories',
  'mitten': 'Accessories',
  'umbrella': 'Accessories',
  'bandana': 'Accessories',
  'headband': 'Accessories',
  'hair clip': 'Accessories',
  'sock': 'Accessories',
  'socks': 'Accessories',
  'stocking': 'Accessories',
  'tights': 'Accessories',

  // Activewear
  'sportswear': 'Activewear',
  'athletic': 'Activewear',
  'yoga': 'Activewear',
  'gym': 'Activewear',
  'sports bra': 'Activewear',
  'workout': 'Activewear',
  'track': 'Activewear',

  // Swimwear
  'swimsuit': 'Swimwear',
  'bikini': 'Swimwear',
  'swimwear': 'Swimwear',
  'swim': 'Swimwear',
  'bathing suit': 'Swimwear',
  'trunks': 'Swimwear',

  // Sleepwear
  'pajama': 'Sleepwear',
  'pajamas': 'Sleepwear',
  'pyjama': 'Sleepwear',
  'nightgown': 'Sleepwear',
  'robe': 'Sleepwear',
  'bathrobe': 'Sleepwear',
  'nightwear': 'Sleepwear',
  'sleepwear': 'Sleepwear',
};

/**
 * Map an ImageNet class name to a clothing category
 * Returns 'Other' if no matching keyword is found
 */
export function mapToClothingCategory(className: string): ClothingCategory {
  const lowerClass = className.toLowerCase();

  // Check each keyword
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lowerClass.includes(keyword)) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Get the best category from multiple predictions
 * Prioritizes non-"Other" categories and higher confidence
 */
export function getBestCategory(
  predictions: Array<{ className: string; probability: number }>
): { category: ClothingCategory; confidence: number } {
  let bestCategory: ClothingCategory = 'Other';
  let bestConfidence = 0;

  for (const pred of predictions) {
    const category = mapToClothingCategory(pred.className);

    // Prefer non-"Other" categories
    if (category !== 'Other') {
      if (bestCategory === 'Other' || pred.probability > bestConfidence) {
        bestCategory = category;
        bestConfidence = pred.probability;
      }
    } else if (bestCategory === 'Other' && pred.probability > bestConfidence) {
      bestConfidence = pred.probability;
    }
  }

  return { category: bestCategory, confidence: bestConfidence };
}
