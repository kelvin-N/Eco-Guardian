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
  {
    id: "climate-everyday-choices",
    title: "Everyday choices and climate impact",
    category: "Climate",
    level: "Beginner",
    duration: "6 min",
    icon: "🌍",
    summary: "Learn how energy, food, travel, and purchasing choices can contribute to climate action.",
    sections: [
      {
        heading: "Look at the whole activity",
        paragraphs: [
          "Climate impact can come from producing energy, making goods, growing food, and moving people and products. The largest opportunities differ between households and communities, so there is no single action that works best for everyone.",
          "When comparing options, consider how often an activity happens, what alternatives are available, and whether a change is practical and accessible.",
        ],
      },
      {
        heading: "Choose changes you can sustain",
        paragraphs: [
          "Using less energy where practical, choosing lower-impact travel when safe, reducing food waste, and keeping useful items in service longer are possible starting points. Community infrastructure and public decisions also shape what choices are available.",
        ],
      },
    ],
    takeaway: "Focus on realistic changes that fit your circumstances, and remember that lasting climate action also depends on wider community and system changes.",
    quiz: [
      {
        question: "Why can climate-friendly priorities differ between households?",
        options: [
          "People have different needs, resources, and available alternatives",
          "Climate science only applies in some homes",
          "Every household uses exactly the same energy",
        ],
        answer: 0,
        explanation: "Circumstances and available options affect which changes are practical.",
      },
      {
        question: "Which is a reasonable way to begin reducing everyday impact?",
        options: [
          "Choose a practical change you can maintain",
          "Make every change at once regardless of cost or safety",
          "Assume one action solves climate change",
        ],
        answer: 0,
        explanation: "Sustainable progress comes from realistic actions and broader collective effort.",
      },
      {
        question: "What else influences the choices people can make?",
        options: ["Community infrastructure and public decisions", "Only personal motivation", "The color of household bins"],
        answer: 0,
        explanation: "Systems and infrastructure shape which options are accessible.",
      },
    ],
  },
  {
    id: "waste-composting",
    title: "Composting food and garden scraps",
    category: "Waste",
    level: "Beginner",
    duration: "5 min",
    icon: "🍂",
    summary: "Understand what composting does and how to follow local collection guidance.",
    sections: [
      {
        heading: "What composting does",
        paragraphs: [
          "Composting is the managed breakdown of suitable organic material into a soil-like product. It can keep some food and garden scraps out of general waste and return organic matter for appropriate uses.",
          "What belongs in a compost bin depends on the system. A home pile, community site, and municipal food-scrap program may accept different materials.",
        ],
      },
      {
        heading: "Keep it suitable for the system",
        paragraphs: [
          "Check the program's accepted-material list before adding items. Some systems accept only fruit and vegetable scraps, while others can process meat, dairy, or certified compostable products. Keep plastic and other contaminants out unless the program specifically accepts them.",
        ],
      },
    ],
    takeaway: "Follow the rules for your local composting system; accepted materials and collection methods vary.",
    quiz: [
      {
        question: "What should you check before adding scraps to a compost program?",
        options: [
          "The program's accepted-material guidance",
          "Whether the packaging says recyclable",
          "Whether the scraps are brightly colored",
        ],
        answer: 0,
        explanation: "Composting systems have different processes and accepted materials.",
      },
      {
        question: "What is a common composting goal?",
        options: [
          "Manage suitable organic material and return organic matter",
          "Turn all waste into drinking water",
          "Make plastics break down in every compost bin",
        ],
        answer: 0,
        explanation: "Composting manages appropriate organic materials, not all kinds of waste.",
      },
      {
        question: "Should plastic be added to a compost bin?",
        options: [
          "Only if the local program explicitly accepts that item",
          "Always, if it is small",
          "Yes, because all plastic composts quickly",
        ],
        answer: 0,
        explanation: "Avoid contamination and follow the specific program's rules.",
      },
    ],
  },
  {
    id: "waste-electronics",
    title: "Handle old electronics responsibly",
    category: "Waste",
    level: "Intermediate",
    duration: "5 min",
    icon: "🔌",
    summary: "Explore repair, reuse, and safe local options for unwanted electronics.",
    sections: [
      {
        heading: "Keep useful devices in use",
        paragraphs: [
          "Electronics contain materials and components that take resources to produce. If a device still works, consider continuing to use it, repairing it, or passing it on through a trusted reuse option.",
          "Before donating or recycling a device, protect your personal information. Back up what you need, sign out of accounts, and use the device maker's instructions to securely erase it.",
        ],
      },
      {
        heading: "Use a suitable collection route",
        paragraphs: [
          "Do not put batteries or electronics in ordinary recycling unless local guidance says they are accepted. Use an authorized take-back or e-waste collection service where available, and follow instructions for damaged or swollen batteries.",
        ],
      },
    ],
    takeaway: "Prioritize safe reuse or repair, protect personal data, and use local authorized collection for devices and batteries.",
    quiz: [
      {
        question: "What is a good option for a working device you no longer need?",
        options: ["Consider repair, continued use, or trusted reuse", "Break it apart and leave it outside", "Put it in any recycling bin"],
        answer: 0,
        explanation: "Keeping useful devices in service can avoid unnecessary disposal.",
      },
      {
        question: "What should you do before passing on a device?",
        options: [
          "Back up needed files and securely erase personal data",
          "Share your account password with the next owner",
          "Leave all accounts signed in",
        ],
        answer: 0,
        explanation: "Protecting your data is an important part of device reuse.",
      },
      {
        question: "Where should old electronics go?",
        options: [
          "An authorized collection route recommended locally",
          "Any household waste bin",
          "A storm drain",
        ],
        answer: 0,
        explanation: "Local authorized programs can handle electronics and batteries appropriately.",
      },
    ],
  },
  {
    id: "energy-efficient-appliances",
    title: "Choose and use appliances efficiently",
    category: "Energy",
    level: "Intermediate",
    duration: "5 min",
    icon: "⚡",
    summary: "Use energy labels and everyday habits to make informed appliance choices.",
    sections: [
      {
        heading: "Compare before you buy",
        paragraphs: [
          "When an appliance needs replacing, compare its energy information using the label or rating system used in your region. Check that the model suits your household's needs; the most efficient option is not helpful if it is unsuitable or does not last.",
          "Purchase price is only part of ownership cost. Energy and water use over time may also matter, though actual use depends on settings, maintenance, and how often the appliance runs.",
        ],
      },
      {
        heading: "Use and maintain it well",
        paragraphs: [
          "Follow the manufacturer's instructions, use appropriate settings, and keep filters or vents maintained as directed. Avoid replacing a functioning appliance early unless there is a clear safety or practical reason.",
        ],
      },
    ],
    takeaway: "Compare reliable local energy information when replacement is needed, then use and maintain the appliance according to its guidance.",
    quiz: [
      {
        question: "When is an efficient replacement appliance worth comparing?",
        options: ["When the current appliance needs replacing", "Every few weeks", "Only after buying the first model you see"],
        answer: 0,
        explanation: "Comparing options at replacement time avoids unnecessary early disposal.",
      },
      {
        question: "What can an energy label help you do?",
        options: [
          "Compare energy information between models",
          "Guarantee exactly how much energy your home will use",
          "Replace the need to check appliance suitability",
        ],
        answer: 0,
        explanation: "Labels support comparisons, while actual use depends on many factors.",
      },
      {
        question: "How should an appliance be maintained?",
        options: [
          "Follow the manufacturer's instructions",
          "Remove safety components to improve airflow",
          "Ignore maintenance guidance",
        ],
        answer: 0,
        explanation: "Manufacturer guidance helps keep equipment working safely and properly.",
      },
    ],
  },
  {
    id: "water-smart-routines",
    title: "Build water-smart daily routines",
    category: "Water",
    level: "Beginner",
    duration: "5 min",
    icon: "🚿",
    summary: "Find practical ways to reduce avoidable water use at home and outdoors.",
    sections: [
      {
        heading: "Notice where water is used",
        paragraphs: [
          "Daily water use can include washing, cooking, cleaning, toilets, gardens, and leaks. The best place to start depends on local water conditions and the fixtures or outdoor space you have.",
          "Shorter running-water tasks, full laundry or dish loads when appropriate, and repairing leaks can help avoid unnecessary use. Follow product instructions and hygiene needs.",
        ],
      },
      {
        heading: "Water gardens thoughtfully",
        paragraphs: [
          "If you care for a garden, use local guidance for watering times, restrictions, and suitable plants. Water needs change with weather, soil, and plant type; avoid runoff and never use water in a way that creates a safety or sanitation problem.",
        ],
      },
    ],
    takeaway: "Use local water guidance and focus on avoidable use, leaks, and garden practices that fit your climate.",
    quiz: [
      {
        question: "What should guide water-saving priorities?",
        options: [
          "Local water conditions and household needs",
          "A rule that is identical everywhere",
          "Ignoring leaks until they stop on their own",
        ],
        answer: 0,
        explanation: "Water supply and conservation needs differ by location.",
      },
      {
        question: "What is a practical response to a persistent leak?",
        options: [
          "Arrange a safe repair or contact a qualified person",
          "Wait indefinitely",
          "Cover it without checking for damage",
        ],
        answer: 0,
        explanation: "Repairing leaks can prevent continued water loss and damage.",
      },
      {
        question: "What should shape garden watering?",
        options: [
          "Local guidance, weather, soil, and plant needs",
          "A fixed schedule regardless of conditions",
          "Watering during restrictions",
        ],
        answer: 0,
        explanation: "Garden water needs and local rules vary.",
      },
    ],
  },
  {
    id: "backyard-habitat",
    title: "Create a welcoming backyard habitat",
    category: "Nature",
    level: "Beginner",
    duration: "6 min",
    icon: "🐝",
    summary: "Support local wildlife with habitat choices suited to your area.",
    sections: [
      {
        heading: "Start with local species",
        paragraphs: [
          "Plants native to a region can provide food or shelter for some local wildlife, but the best choices depend on the specific place and habitat. Ask a local conservation group, native-plant nursery, or extension service for suitable options.",
          "A mix of locally appropriate plants that flower or fruit at different times can support a range of wildlife. Avoid introducing invasive species and check local guidance before planting.",
        ],
      },
      {
        heading: "Make the space safer",
        paragraphs: [
          "Reduce unnecessary pesticide use, keep pets from disturbing wildlife, and provide water only where it can be kept clean and safe. Even a small patch of connected habitat can be useful; do not handle wild animals or disturb nesting sites.",
        ],
      },
    ],
    takeaway: "Use local ecological advice, avoid invasive plants, and make habitat choices that are safe for wildlife and people.",
    quiz: [
      {
        question: "How can you choose suitable plants for local wildlife?",
        options: [
          "Seek guidance from a trusted local ecological source",
          "Choose any fast-growing plant",
          "Assume all non-native plants are harmless",
        ],
        answer: 0,
        explanation: "Local expertise helps identify appropriate species and avoid invasive plants.",
      },
      {
        question: "What is a considerate way to protect backyard wildlife?",
        options: [
          "Limit unnecessary pesticide use and disturbance",
          "Handle nests to inspect them",
          "Introduce unfamiliar animals",
        ],
        answer: 0,
        explanation: "Reducing disturbance and unnecessary chemicals can make habitat safer.",
      },
      {
        question: "Should habitat advice be the same in every region?",
        options: [
          "No, species and ecological conditions are local",
          "Yes, every region has identical ecosystems",
          "Only gardens need local advice",
        ],
        answer: 0,
        explanation: "Local conditions determine which species and practices are appropriate.",
      },
    ],
  },
  {
    id: "plan-greener-trips",
    title: "Plan a lower-impact trip",
    category: "Transport",
    level: "Beginner",
    duration: "5 min",
    icon: "🗺️",
    summary: "Plan ahead to combine trips and compare safe, accessible travel options.",
    sections: [
      {
        heading: "Think about the trip",
        paragraphs: [
          "Before leaving, consider the distance, timing, weather, mobility needs, and what transport is available. Walking, cycling, public transport, and shared trips may suit some journeys, but no one option is right for everyone.",
          "Combining errands or choosing a nearby destination can sometimes avoid separate trips. Check schedules and access before relying on a route.",
        ],
      },
      {
        heading: "Keep safety and access first",
        paragraphs: [
          "Use routes and equipment that are safe for you, follow local road rules, and adapt plans to weather and personal needs. If a lower-impact option is not safe or accessible, choose a practical alternative without guilt.",
        ],
      },
    ],
    takeaway: "Plan realistic journeys that reduce unnecessary travel while prioritizing safety, access, and local conditions.",
    quiz: [
      {
        question: "What can help avoid unnecessary travel?",
        options: [
          "Combining errands when practical",
          "Taking several separate trips for nearby tasks",
          "Ignoring travel distance",
        ],
        answer: 0,
        explanation: "Combining tasks can reduce the number of separate journeys.",
      },
      {
        question: "What should come first when choosing a travel mode?",
        options: [
          "Safety, accessibility, and the needs of the trip",
          "Choosing the same mode for every person",
          "Ignoring local conditions",
        ],
        answer: 0,
        explanation: "Travel options need to be safe and accessible for the individual journey.",
      },
      {
        question: "Is a lower-impact travel option always available?",
        options: [
          "No, availability and accessibility vary",
          "Yes, for every trip and person",
          "Only during holidays",
        ],
        answer: 0,
        explanation: "Transport infrastructure and personal needs differ.",
      },
    ],
  },
  {
    id: "food-less-waste",
    title: "Make food go further",
    category: "Food",
    level: "Intermediate",
    duration: "6 min",
    icon: "🥕",
    summary: "Use meal planning, storage, and flexible cooking to reduce avoidable food waste.",
    sections: [
      {
        heading: "Plan around what you have",
        paragraphs: [
          "Before shopping, check what is already in your kitchen and plan a few meals around it. A flexible list can help you buy quantities you are likely to use while leaving room for changing schedules.",
          "Store food according to its label and local food-safety guidance. Keep older suitable items visible so they are easier to use first.",
        ],
      },
      {
        heading: "Use safe, flexible options",
        paragraphs: [
          "Some ingredients can be used in soups, sauces, or other flexible meals, and suitable foods can sometimes be frozen for later. Do not rely on appearance or smell alone to judge food safety; follow date labels and public health advice for your location.",
          "Food scraps that cannot be eaten may be accepted by a local compost or organics program. Check its rules before adding them.",
        ],
      },
    ],
    takeaway: "Plan realistically, store food safely, and follow local guidance for both food safety and scraps.",
    quiz: [
      {
        question: "What is a useful first step before grocery shopping?",
        options: [
          "Check what food you already have",
          "Buy duplicates without checking",
          "Ignore household plans",
        ],
        answer: 0,
        explanation: "Checking existing food can help you plan meals and avoid unnecessary purchases.",
      },
      {
        question: "What should guide food storage and safety?",
        options: [
          "Product labels and local food-safety guidance",
          "Guessing based only on smell",
          "Leaving all food at room temperature",
        ],
        answer: 0,
        explanation: "Reliable safety guidance is more dependable than guesswork.",
      },
      {
        question: "Can all food scraps go into every compost program?",
        options: [
          "No, check the program's accepted-material rules",
          "Yes, all programs accept everything",
          "Only if the scraps are in plastic bags",
        ],
        answer: 0,
        explanation: "Composting systems differ in what materials they can process.",
      },
    ],
  },
];
