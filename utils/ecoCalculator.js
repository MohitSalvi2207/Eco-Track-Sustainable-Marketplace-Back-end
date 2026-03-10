/**
 * Eco Calculator Utility
 * Calculates environmental impact of eco-friendly purchases
 */

// Carbon savings per eco rating point (kg CO2)
const CARBON_FACTOR = {
    'Very Low': 1.5,
    'Low': 1.0,
    'Medium': 0.5,
    'High': 0.1
};

// Plastic reduction per packaging type (kg)
const PLASTIC_FACTOR = {
    '100% Recyclable': 0.3,
    'Biodegradable': 0.25,
    'Compostable': 0.25,
    'Minimal Packaging': 0.2,
    'Plastic-Free': 0.4,
    'Reusable': 0.35,
    'Standard': 0
};

// Water savings based on eco rating (liters)
const WATER_FACTOR = 2.5; // liters per eco rating point

/**
 * Calculate eco impact for a single product purchase
 */
const calculateProductImpact = (product, quantity = 1) => {
    const carbonSaved = (product.ecoImpact?.carbonSavedPerUnit || CARBON_FACTOR[product.carbonFootprint] || 0) * quantity;
    const plasticReduced = (product.ecoImpact?.plasticReducedPerUnit || PLASTIC_FACTOR[product.packagingType] || 0) * quantity;
    const waterSaved = (product.ecoImpact?.waterSavedPerUnit || (product.ecoRating * WATER_FACTOR)) * quantity;

    return {
        carbonSaved: Math.round(carbonSaved * 100) / 100,
        plasticReduced: Math.round(plasticReduced * 100) / 100,
        waterSaved: Math.round(waterSaved * 100) / 100
    };
};

/**
 * Calculate eco impact for an entire order
 */
const calculateOrderImpact = (items) => {
    let totalCarbon = 0;
    let totalPlastic = 0;
    let totalWater = 0;

    items.forEach(item => {
        const impact = calculateProductImpact(item.product || item, item.quantity || 1);
        totalCarbon += impact.carbonSaved;
        totalPlastic += impact.plasticReduced;
        totalWater += impact.waterSaved;
    });

    const ecoScore = Math.round((totalCarbon * 2 + totalPlastic * 3 + totalWater * 0.1) * 10) / 10;

    return {
        carbonSaved: Math.round(totalCarbon * 100) / 100,
        plasticReduced: Math.round(totalPlastic * 100) / 100,
        waterSaved: Math.round(totalWater * 100) / 100,
        ecoScoreEarned: ecoScore,
        treesEquivalent: Math.round((totalCarbon / 21) * 100) / 100 // 1 tree absorbs ~21kg CO2/year
    };
};

/**
 * Get sustainability level label
 */
const getSustainabilityLabel = (ecoRating) => {
    if (ecoRating >= 4.5) return 'Excellent';
    if (ecoRating >= 3.5) return 'Very Good';
    if (ecoRating >= 2.5) return 'Good';
    if (ecoRating >= 1.5) return 'Fair';
    return 'Basic';
};

module.exports = { calculateProductImpact, calculateOrderImpact, getSustainabilityLabel };
