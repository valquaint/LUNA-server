type faction = {
    description: string,
    short: string,
    skills: Array<Number>,
    resource: string,
    resource_description: string,
    ucr: string,
    ucr_description: string
}


const Aerun: faction = {
    description: `The time of terran involvement is over. We reject the old ways and commence with the new. Life must evolve, and we find ourselves pushing against those who refuse to move forward. We took everything from the land, and now it is now below us. There are vast riches in the stars, though we currently still need the atmosphere to live. We work towards a future without the need of base land resources. We rise above those who stay on the land, and those who refuse to look above!`,
    short: `Rise Above... Become Anew.`,
    skills: [1, 2, 3],
    resource: "Fluxodine",
    resource_description: "A magical fuel found deep within the planet. Long-term exposure to the substance has resulted in hallucinogenic effects, but the raw power of this chemical has proven to be invaluable for interstellar travel.",
    ucr: "Starmetal",
    ucr_description: "Lighter than any metal found on the planet, Starmetal is an incredibly durable material found in abundance on primarily on asteroids. Highly regarded for its durability and strength, the Aerun prefer it over any other material found on the planet for use in their construction projects."
};
const Regents: faction = {
    description: `The old ways have always worked for those with money and power. Responsibility is of no consequence when you can live beyond the circumstances of the working class. It is nothing to continue to mine and take what the land has to give. When those without could no longer survive, invention continued in their place. What else is life but to have pleasure? Those who wish to take our resources must find their way in our society, or perish.`,
    short: `Progress through Profit.`,
    skills: [4, 5, 6],
    resource: "Synthesized Saphires",
    resource_description: "Durable, Versatile, and Beautiful. All qualities of the perfect material. These precious gemstones are perfect for the highly advanced technologies used in our modern age.",
    ucr: "Nanotubes",
    ucr_description: "The technology of the future must be designed with the most precise components, and that is impossible without Nanotubes. These incredibly small pieces of technology make up the the inner workings of almost every building within the Regency."
};
const Enlightened: faction = {
    description: `Greed has razed our lands for too long. We choose to reconnect with the peaceful ways of living with the land we have been so graciously given. Everything has life, and we know that we can grow towards a future that considers the land as our equal. We shall find the remnants of those who perished from their greed, pulling their resources and poison from the land. The planet should not have to suffer those who do not cherish it.`,
    short: `Redemption, Reclamation, Rebirth.`,
    skills: [7, 8, 9],
    resource: "Silkleaf Bark",
    resource_description: "Once the most magnificent tree on the planet, now preserved in a crystaline state. A material stronger than any metal, yet more precious than any stone. Our home's gift to let us thrive as we leave the cradle.",
    ucr: "Silver Resin",
    ucr_description: "The only substance strong enough to bond with Silkleaf Bark - Silver Resin. As a liquid, it can be quite toxic, however once it hardens the uses can seem to be almost endless..."
};

const factions = {
    Aerun,
    Regents,
    Enlightened
}

export default factions;