type expedition = {
    description: string,
    options : Array<options>,
    requirements?: null | values
}

type values = {
    ucr?: number,
    crew?: number,
    resources?: number,
    time?: number,
    currency?: number,
    max_currency?: number,
    max_ucr?: number,
    max_crew?: number,
    max_resources?: number,
    max_time?: number
}

type options = {
    button : string,
    description : string,
    changes: values,
    requirements?: null | values,
    randomness?: boolean
}


export const expeditions: expedition[] = [
    {
        description: "Captain! We appear to have navigated into an uncharted asteroid belt! Your orders?",
        options: [
            {
                button: "Go around quickly!",
                description: "Time is precious! Find the quickest way around!",
                changes: {
                    resources: 0,
                    max_resources: -2
                },
                randomness: true
            },
            {
                button: "Go around Carefully!",
                description: "Attempt to navigate the asteroids carefully, at the cost of time.",
                changes: {
                    time: 1,
                    max_time: 3,
                    resources: 0,
                    max_resources: 2
                },
                randomness: true
            },
            {
                button: "Harvest The Asteroids",
                description: "There might be something valuable here...",
                changes: {
                    time: 2,
                    max_time: 4,
                    ucr: 0,
                    max_ucr: 4
                },
                randomness: true
            },
        ],
        requirements: null
    },{
        description: "Pirates! They appear to have ambushed us out of nowhere!",
        options: [
            {
                button: "Flee!",
                description: "(Random chance of success)",
                changes: {
                    resources: 0,
                    max_resources: -2,
                    ucr: 0,
                    max_ucr: -2
                },
                randomness: true
            },
            {
                button: "Flee!",
                description: "(Random chance of success)",
                changes: {
                    resources: 0,
                    ucr: 0
                },
                randomness: false
            },
            {
                button: "Fight Aggresively!",
                description: "(Random chance of success)",
                changes: {
                    time: 2,
                    max_time: 4,
                    ucr: -3,
                    max_ucr: 3,
                    resources: -3,
                    max_resources: 3,
                    currency: 1,
                    max_currency: 5
                },
                randomness: true,
                requirements: {
                    resources: 3
                }
            },
            {
                button: "Fight Tactfully!",
                description: "(Random chance of success)",
                changes: {
                    time: 2,
                    max_time: 4,
                    ucr: -1,
                    max_ucr: 1,
                    resources: -1,
                    max_resources: 1,
                    currency: 1,
                    max_currency: 5
                },
                randomness: true,
                requirements: {
                    resources: 1
                }
            },
            {
                button: "Negotiate!",
                description: "(Random chance of success)",
                changes: {
                    time: 2,
                    max_time: 4,
                    ucr: -2,
                    max_ucr: 2,
                    resources: -2,
                    max_resources: 2,
                    currency: 1,
                    max_currency: 5
                },
                randomness: true,
                requirements: {
                    resources: 2
                }
            },
        ],
        requirements: null
    },
]