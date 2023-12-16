type product = {
    faction: 1 | 2 | 3, // Owning Faction
    type: 1 | 2 | 3 | 4 | 5, // Product Type - 1 POWER, 2 WATER, 3 POPULATION, 4 UCR, 5 FAC RES
    ucr: number, // Cost of Unique Resource
    power: number, // Power Cost in Upkeep
    gain: number, // Gain per Day
    water: number, // Water Cost in Upkeep
    name: string, // Product Name
    description: string // Product Description
}

export const products: product[] = [ // Aerun Structures
    {
        faction: 1,
        type: 1, // Power Generation
        ucr: 3,
        power: 0,
        gain: 2,
        water: 0,
        name: "Small Solar Farm",
        description: "While basic, no new colony is without this basic solar farm."
    },
    {
        faction: 1,
        type: 2, //Water Generation
        ucr: 3,
        power: 1,
        gain: 1,
        water: 0,
        name: "Solar Still",
        description: "Adapted out of millenia-old designs, the power of the sun brings water from the surface below into resivoirs above."
    },
    {
        faction: 1,
        type: 3, // Population
        ucr: 4,
        power: 3,
        gain: 3,
        water: 3,
        name: "Biohome",
        description: "Cheap, affordable, adaptable. Who needs luxury when you have all of your needs met by tube?"
    },
    // Enlightened Structures
    {
        faction: 2,
        type: 1, // Power Generation
        ucr: 3,
        power: 0,
        gain: 2,
        water: 0,
        name: "Basic Water Wheel",
        description: "Harness the natural flowing water around your colony to produce a small amount of power."
    },
    {
        faction: 2,
        type: 2, //Water Generation
        ucr: 3,
        power: 1,
        gain: 1,
        water: 0,
        name: "Basic Dam",
        description: "Reroute some natural water through various different filtration mechanisms to small reserves."
    },
    {
        faction: 2,
        type: 3, // Population
        ucr: 4,
        power: 3,
        gain: 3,
        water: 3,
        name: "Canopy Housing",
        description: "Place some cheap and effective housing among the trees!"
    },
    // Regent Structures
    {
        faction: 3,
        type: 1, // Power Generation
        ucr: 3,
        power: 0,
        gain: 2,
        water: 0,
        name: "Crude Generator",
        description: "This resource seems burnable... Must fuel something, right?"
    },
    {
        faction: 3,
        type: 2, //Water Generation
        ucr: 3,
        power: 1,
        gain: 1,
        water: 0,
        name: "Small Aqueduct",
        description: "Water in the desert? Vast, open space for expansion, I say!"
    },
    {
        faction: 3,
        type: 3, // Population
        ucr: 4,
        power: 3,
        gain: 3,
        water: 3,
        name: "Small Barracks",
        description: "Efficiency before Elegance. Function over Form."
    },
]