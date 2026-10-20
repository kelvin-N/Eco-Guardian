export const LESSONS = [
  {
    id: "climate-basics",
    title: "Climate change, clearly explained",
    category: "Climate",
    level: "Beginner",
    duration: "6 min",
    icon: "🌡️",
    summary: "Understand the greenhouse effect and the difference between weather and climate.",
    sections: [
      {
        heading: "The greenhouse effect",
        paragraphs: [
          "Sunlight warms Earth’s surface. The surface releases some of that energy as heat, and greenhouse gases in the atmosphere absorb and re-emit part of it. This natural process keeps Earth warm enough for life.",
          "Burning coal, oil, and gas, clearing forests, and some kinds of agriculture add extra greenhouse gases. The additional heat trapped in the atmosphere is warming the planet and changing climate patterns.",
        ],
      },
      {
        heading: "Weather and climate are different",
        paragraphs: [
          "Weather describes conditions over a short time: today’s rain, wind, or temperature. Climate describes the patterns and averages observed over many years. A cold day does not disprove a long-term warming trend.",
        ],
      },
    ],
    takeaway: "Reducing fossil-fuel use and protecting forests can limit additional warming; adapting to changes already underway also matters.",
    quiz: [
      {
        question: "What does climate describe?",
        options: [
          "Conditions at one place this afternoon",
          "Long-term patterns in weather",
          "Only the temperature in summer",
        ],
        answer: 1,
        explanation: "Climate is measured from weather patterns over long periods.",
      },
      {
        question: "Why are human activities warming the planet?",
        options: [
          "They add heat-trapping greenhouse gases to the atmosphere",
          "They make the Sun shine more strongly",
          "They stop all clouds from forming",
        ],
        answer: 0,
        explanation: "Extra greenhouse gases trap more heat in the Earth system.",
      },
      {
        question: "Can a cold day occur during a warming climate?",
        options: ["No, every day must be warmer", "Yes, weather varies day to day", "Only near the equator"],
        answer: 1,
        explanation: "Short-term weather varies even as long-term averages change.",
      },
    ],
  },
  {
    id: "waste-smarter",
    title: "Waste less, use more",
    category: "Waste",
    level: "Beginner",
    duration: "5 min",
    icon: "♻️",
    summary: "Use the waste hierarchy to make practical choices before recycling.",
    sections: [
      {
        heading: "Start before the bin",
        paragraphs: [
          "The most effective way to manage waste is often to avoid creating it. Choose durable items, borrow or repair when practical, and buy only what you can use.",
          "Reusing an item usually avoids more of its original material and manufacturing impacts than recycling it. Recycling still helps when an item cannot be reused and the local system accepts it.",
        ],
      },
      {
        heading: "Recycle correctly",
        paragraphs: [
          "Accepted materials differ by community. Check your local collection guidance, keep food and liquids out of recyclables where required, and never put uncertain materials in a recycling bin just to be hopeful.",
        ],
      },
    ],
    takeaway: "Refuse or reduce first, reuse next, and recycle only according to local rules.",
    quiz: [
      {
        question: "Which choice generally prevents waste first?",
        options: ["Buying a durable item you need", "Recycling every item", "Throwing items into mixed bins"],
        answer: 0,
        explanation: "Avoiding unnecessary purchases prevents material use and waste.",
      },
      {
        question: "What should you check before recycling an item?",
        options: ["Whether it is accepted by your local program", "Whether it has a bright color", "Whether it feels lightweight"],
        answer: 0,
        explanation: "Recycling rules vary, so local guidance is the right source.",
      },
      {
        question: "Why can reusing be better than recycling?",
        options: [
          "It can keep the item useful without processing it into new material",
          "Recycling is never useful",
          "Reuse makes every item last forever",
        ],
        answer: 0,
        explanation: "Reuse can avoid the energy and processing needed to recycle and remake an item.",
      },
    ],
  },
  {
    id: "home-energy",
    title: "A more energy-aware home",
    category: "Energy",
    level: "Beginner",
    duration: "5 min",
    icon: "💡",
    summary: "Learn where household energy goes and which improvements have lasting value.",
    sections: [
      {
        heading: "Measure before changing",
        paragraphs: [
          "Heating, cooling, water heating, lighting, and appliances all use energy. The largest use depends on the building, climate, equipment, and household habits.",
          "A bill or meter reading can help you spot changes over time. Compare similar seasons and account for weather or changes in how many people use the home.",
        ],
      },
      {
        heading: "Choose practical improvements",
        paragraphs: [
          "Sealing drafts, using efficient lighting, maintaining equipment, and choosing efficient appliances when replacing old ones can reduce energy use. Set temperatures for comfort and safety, and follow manufacturer guidance.",
        ],
      },
    ],
    takeaway: "Start with what your energy bill or meter says; focus on safe changes that fit your home.",
    quiz: [
      {
        question: "What is a useful first step to understand home energy use?",
        options: ["Check bills or meter readings over time", "Replace every appliance immediately", "Keep all lights on for a day"],
        answer: 0,
        explanation: "Measurements help you identify patterns before choosing improvements.",
      },
      {
        question: "When is an efficient appliance often easiest to choose?",
        options: ["When replacing an appliance that already needs replacement", "Every month", "Only when the power is off"],
        answer: 0,
        explanation: "Replacing equipment at end of life avoids unnecessary early replacement.",
      },
      {
        question: "What should guide safe household energy changes?",
        options: ["Manufacturer guidance and household safety", "A social media trend", "Ignoring local conditions"],
        answer: 0,
        explanation: "Safety and equipment guidance matter when changing home systems.",
      },
    ],
  },
  {
    id: "healthy-water",
    title: "Protecting water close to home",
    category: "Water",
    level: "Beginner",
    duration: "5 min",
    icon: "💧",
    summary: "Discover everyday ways to conserve water and reduce pollution.",
    sections: [
      {
        heading: "Water is local",
        paragraphs: [
          "Water availability and treatment systems differ between communities. A useful conservation action in one place may be less important somewhere else, so local utility or watershed guidance can help set priorities.",
          "Leaks, unnecessary running water, and inefficient fixtures can waste treated water. Fixing a leak and using water thoughtfully are good starting points.",
        ],
      },
      {
        heading: "Keep pollutants out",
        paragraphs: [
          "Oil, chemicals, medicines, and litter can reach waterways through drains or runoff. Follow local disposal instructions and keep storm drains clear of waste.",
        ],
      },
    ],
    takeaway: "Use water thoughtfully and dispose of household chemicals and medicines through approved local options.",
    quiz: [
      {
        question: "Why should water-saving priorities consider local conditions?",
        options: ["Water availability and systems vary by place", "Water is identical everywhere", "Local guidance never changes"],
        answer: 0,
        explanation: "Local supplies, ecosystems, and infrastructure are different.",
      },
      {
        question: "What is a sensible response to a household leak?",
        options: ["Repair it when safe or contact a qualified person", "Ignore it indefinitely", "Pour chemicals down the drain"],
        answer: 0,
        explanation: "Repairing leaks prevents unnecessary water loss.",
      },
      {
        question: "How should unused medicines be disposed of?",
        options: ["Follow local take-back or disposal guidance", "Flush all medicines", "Leave them beside a stream"],
        answer: 0,
        explanation: "Local programs provide safer disposal routes than waterways.",
      },
    ],
  },
  {
    id: "biodiversity",
    title: "Biodiversity and healthy ecosystems",
    category: "Nature",
    level: "Beginner",
    duration: "6 min",
    icon: "🦋",
    summary: "See how living things and habitats support resilient ecosystems.",
    sections: [
      {
        heading: "Many forms of life, connected",
        paragraphs: [
          "Biodiversity includes the variety of species, genetic differences within species, and ecosystems. Living things interact through food webs, pollination, decomposition, and many other processes.",
          "Healthy ecosystems can provide benefits such as clean water, fertile soils, food, and natural protection from some hazards. These benefits depend on healthy habitats and communities of organisms.",
        ],
      },
      {
        heading: "Care for nearby nature",
        paragraphs: [
          "Planting appropriate native species, reducing pesticide use where possible, keeping pets from disturbing wildlife, and joining local habitat projects can help. Follow local advice, especially around invasive species and wildlife.",
        ],
      },
    ],
    takeaway: "Protecting habitat and following local ecological guidance supports biodiversity over time.",
    quiz: [
      {
        question: "What does biodiversity include?",
        options: ["Only large animals", "Variety of life, genes, and ecosystems", "Only the number of trees"],
        answer: 1,
        explanation: "Biodiversity includes variety within species, between species, and across ecosystems.",
      },
      {
        question: "Why are pollinators important?",
        options: ["They help many plants reproduce", "They remove all air pollution", "They replace healthy soil"],
        answer: 0,
        explanation: "Pollination supports reproduction for many plant species.",
      },
      {
        question: "What should guide planting for wildlife?",
        options: ["Local advice on appropriate native species", "Planting any species anywhere", "Removing all habitat"],
        answer: 0,
        explanation: "Local ecological guidance helps avoid harmful introductions.",
      },
    ],
  },
  {
    id: "lower-impact-travel",
    title: "Lower-impact everyday travel",
    category: "Transport",
    level: "Beginner",
    duration: "5 min",
    icon: "🚲",
    summary: "Compare travel options while keeping safety, distance, and access in mind.",
    sections: [
      {
        heading: "Trips have different needs",
        paragraphs: [
          "Travel impacts depend on distance, vehicle, occupancy, energy source, and local infrastructure. A short walk or cycle may work for some journeys, while public transport, shared rides, or remote participation can suit others.",
          "Not every option is safe or accessible for every person. Consider mobility needs, weather, timing, and road conditions before choosing.",
        ],
      },
      {
        heading: "Make a realistic plan",
        paragraphs: [
          "Combining errands, using public transit where practical, sharing a ride, or choosing an efficient vehicle when replacing one can reduce impacts without compromising safety or access.",
        ],
      },
    ],
    takeaway: "Choose the lowest-impact option that is safe, accessible, and practical for the trip.",
    quiz: [
      {
        question: "What is the best way to choose a travel option?",
        options: ["Consider impact, safety, access, and trip needs", "Always choose the same mode", "Ignore distance and weather"],
        answer: 0,
        explanation: "A useful travel choice balances environmental impact with real needs.",
      },
      {
        question: "What can combining errands help reduce?",
        options: ["Unnecessary separate trips", "Road safety", "The need to plan"],
        answer: 0,
        explanation: "Combining trips can reduce total travel when practical.",
      },
      {
        question: "Is cycling the right option for every person and trip?",
        options: ["Yes, regardless of conditions", "No, safety and accessibility matter", "Only during rush hour"],
        answer: 1,
        explanation: "Travel choices should account for safety and accessibility.",
      },
    ],
  },
];
