/**
 * Destinations Database
 * 12 countries × 5 destinations each = 60 curated travel destinations
 * All coordinates are real. All Unsplash photo IDs are real.
 */

export const destinations = {
  japan: [
    {
      name: 'Kyoto',
      country: 'Japan',
      countryCode: 'JP',
      description: 'Ancient temples and bamboo groves in Japan\'s cultural heart, where centuries of tradition blend with serene natural beauty.',
      lat: 35.0116,
      lon: 135.7681,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Mount Fuji',
      country: 'Japan',
      countryCode: 'JP',
      description: 'Japan\'s iconic snow-capped volcano rising majestically above the clouds, a sacred symbol of beauty and endurance.',
      lat: 35.3606,
      lon: 138.7274,
      imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Nara',
      country: 'Japan',
      countryCode: 'JP',
      description: 'Sacred deer roam freely among ancient wooden temples in this peaceful former capital steeped in history.',
      lat: 34.6851,
      lon: 135.8048,
      imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Osaka',
      country: 'Japan',
      countryCode: 'JP',
      description: 'Neon-lit streets pulse with energy in Japan\'s kitchen, where street food culture meets vibrant nightlife.',
      lat: 34.6937,
      lon: 135.5023,
      imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Hakone',
      country: 'Japan',
      countryCode: 'JP',
      description: 'Hot spring resort town nestled in the mountains with breathtaking views of Mount Fuji across serene lakes.',
      lat: 35.2326,
      lon: 139.1070,
      imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&q=80'
    }
  ],

  italy: [
    {
      name: 'Venice',
      country: 'Italy',
      countryCode: 'IT',
      description: 'A floating city of labyrinthine canals, ornate bridges, and Gothic palaces rising from the shimmering Adriatic.',
      lat: 45.4408,
      lon: 12.3155,
      imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Dolomites',
      country: 'Italy',
      countryCode: 'IT',
      description: 'Dramatic limestone spires pierce the sky above emerald valleys in the most spectacular mountain range in the Alps.',
      lat: 46.4102,
      lon: 11.8440,
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Cinque Terre',
      country: 'Italy',
      countryCode: 'IT',
      description: 'Five colorful fishing villages cling to rugged cliffs above the turquoise Mediterranean, connected by ancient trails.',
      lat: 44.1461,
      lon: 9.6439,
      imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Rome',
      country: 'Italy',
      countryCode: 'IT',
      description: 'The Eternal City layers millennia of history, from the Colosseum\'s ancient grandeur to Baroque fountains and vibrant piazzas.',
      lat: 41.9028,
      lon: 12.4964,
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Lake Como',
      country: 'Italy',
      countryCode: 'IT',
      description: 'Crystal-clear alpine waters reflect grand villas and lush gardens along the shores of Italy\'s most elegant lake.',
      lat: 45.9943,
      lon: 9.2572,
      imageUrl: 'https://images.unsplash.com/photo-1537799943037-f5da89a65689?w=800&h=600&fit=crop&q=80'
    }
  ],

  france: [
    {
      name: 'Paris',
      country: 'France',
      countryCode: 'FR',
      description: 'The City of Light enchants with its iconic iron tower, grand boulevards, world-class art, and café-lined streets.',
      lat: 48.8566,
      lon: 2.3522,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Nice',
      country: 'France',
      countryCode: 'FR',
      description: 'Azure waters meet pastel-hued buildings along the sun-drenched Promenade des Anglais on the glamorous French Riviera.',
      lat: 43.7102,
      lon: 7.2620,
      imageUrl: 'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Provence',
      country: 'France',
      countryCode: 'FR',
      description: 'Rolling lavender fields paint the countryside purple beneath golden sunlight in the heart of southern France.',
      lat: 43.9493,
      lon: 6.0679,
      imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Mont Saint-Michel',
      country: 'France',
      countryCode: 'FR',
      description: 'A medieval abbey perches on a tidal island, rising like a fairytale fortress from the vast Normandy mudflats.',
      lat: 48.6361,
      lon: -1.5115,
      imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Chamonix',
      country: 'France',
      countryCode: 'FR',
      description: 'Adventure capital at the foot of Mont Blanc, where dramatic glaciers and soaring peaks draw mountaineers year-round.',
      lat: 45.9237,
      lon: 6.8694,
      imageUrl: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=800&h=600&fit=crop&q=80'
    }
  ],

  usa: [
    {
      name: 'New York',
      country: 'United States',
      countryCode: 'US',
      description: 'The city that never sleeps dazzles with towering skyscrapers, world-famous landmarks, and boundless cultural energy.',
      lat: 40.7128,
      lon: -74.0060,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'San Francisco',
      country: 'United States',
      countryCode: 'US',
      description: 'Fog rolls beneath the Golden Gate as steep streets lined with Victorian homes cascade toward the sparkling bay.',
      lat: 37.7749,
      lon: -122.4194,
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Grand Canyon',
      country: 'United States',
      countryCode: 'US',
      description: 'A mile-deep chasm carved by the Colorado River reveals billions of years of Earth\'s geological story in vivid color.',
      lat: 36.1069,
      lon: -112.1129,
      imageUrl: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Miami',
      country: 'United States',
      countryCode: 'US',
      description: 'Art Deco architecture meets tropical beaches and Latin American flair in this sun-soaked coastal playground.',
      lat: 25.7617,
      lon: -80.1918,
      imageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Yosemite',
      country: 'United States',
      countryCode: 'US',
      description: 'Granite monoliths, thundering waterfalls, and ancient sequoia groves define this awe-inspiring wilderness cathedral.',
      lat: 37.8651,
      lon: -119.5383,
      imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop&q=80'
    }
  ],

  uk: [
    {
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      description: 'A world capital where royal palaces, cutting-edge culture, and centuries of history converge along the Thames.',
      lat: 51.5074,
      lon: -0.1278,
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Edinburgh',
      country: 'United Kingdom',
      countryCode: 'GB',
      description: 'A dramatic castle crowns volcanic rock above a medieval Old Town of winding cobbled lanes and hidden courtyards.',
      lat: 55.9533,
      lon: -3.1883,
      imageUrl: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Cotswolds',
      country: 'United Kingdom',
      countryCode: 'GB',
      description: 'Honey-colored stone cottages nestle among rolling green hills in England\'s most picturesque countryside.',
      lat: 51.8330,
      lon: -1.8433,
      imageUrl: 'https://images.unsplash.com/photo-1589459072535-550f4fae08d4?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Lake District',
      country: 'United Kingdom',
      countryCode: 'GB',
      description: 'Mist-shrouded peaks reflect in still mountain lakes across England\'s most romantic and poetic landscape.',
      lat: 54.4609,
      lon: -3.0886,
      imageUrl: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Bath',
      country: 'United Kingdom',
      countryCode: 'GB',
      description: 'Georgian crescents and ancient Roman baths make this elegant spa city a timeless masterpiece of architecture.',
      lat: 51.3811,
      lon: -2.3590,
      imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&h=600&fit=crop&q=80'
    }
  ],

  australia: [
    {
      name: 'Sydney',
      country: 'Australia',
      countryCode: 'AU',
      description: 'Iconic sails of the Opera House gleam against a harbor backdrop where urban sophistication meets coastal beauty.',
      lat: -33.8688,
      lon: 151.2093,
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Great Barrier Reef',
      country: 'Australia',
      countryCode: 'AU',
      description: 'The world\'s largest coral reef system teems with kaleidoscopic marine life across warm tropical waters.',
      lat: -18.2871,
      lon: 147.6992,
      imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Uluru',
      country: 'Australia',
      countryCode: 'AU',
      description: 'A massive sandstone monolith glows fiery red at sunset in the spiritual heart of the Australian Outback.',
      lat: -25.3444,
      lon: 131.0369,
      imageUrl: 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Melbourne',
      country: 'Australia',
      countryCode: 'AU',
      description: 'Laneway street art, world-class coffee culture, and eclectic neighborhoods define Australia\'s creative capital.',
      lat: -37.8136,
      lon: 144.9631,
      imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Blue Mountains',
      country: 'Australia',
      countryCode: 'AU',
      description: 'Ancient eucalyptus forests release a blue haze over dramatic sandstone cliffs and plunging valleys.',
      lat: -33.7150,
      lon: 150.3120,
      imageUrl: 'https://images.unsplash.com/photo-1494233892892-84542a694e72?w=800&h=600&fit=crop&q=80'
    }
  ],

  brazil: [
    {
      name: 'Rio de Janeiro',
      country: 'Brazil',
      countryCode: 'BR',
      description: 'Christ the Redeemer watches over golden beaches and jungle-clad mountains in this vibrant carnival city.',
      lat: -22.9068,
      lon: -43.1729,
      imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Iguazu Falls',
      country: 'Brazil',
      countryCode: 'BR',
      description: 'Hundreds of cascades thunder into a misty abyss in one of the planet\'s most powerful natural spectacles.',
      lat: -25.6953,
      lon: -54.4367,
      imageUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Fernando de Noronha',
      country: 'Brazil',
      countryCode: 'BR',
      description: 'A pristine volcanic archipelago with crystal-clear waters, spinner dolphins, and Brazil\'s most perfect beaches.',
      lat: -3.8540,
      lon: -32.4280,
      imageUrl: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Salvador',
      country: 'Brazil',
      countryCode: 'BR',
      description: 'Colonial architecture painted in tropical colors lines cobblestone streets alive with Afro-Brazilian music and dance.',
      lat: -12.9714,
      lon: -38.5124,
      imageUrl: 'https://images.unsplash.com/photo-1551135049-8a33b5883817?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Amazon',
      country: 'Brazil',
      countryCode: 'BR',
      description: 'The planet\'s lungs pulse with life in this vast emerald wilderness of winding rivers and uncharted rainforest.',
      lat: -3.4653,
      lon: -62.2159,
      imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop&q=80'
    }
  ],

  iceland: [
    {
      name: 'Reykjavik',
      country: 'Iceland',
      countryCode: 'IS',
      description: 'The world\'s northernmost capital charms with colorful rooftops, geothermal pools, and a thriving creative scene.',
      lat: 64.1466,
      lon: -21.9426,
      imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Blue Lagoon',
      country: 'Iceland',
      countryCode: 'IS',
      description: 'Milky-blue geothermal waters steam amid black lava fields in this otherworldly Icelandic bathing paradise.',
      lat: 63.8804,
      lon: -22.4495,
      imageUrl: 'https://images.unsplash.com/photo-1515861209596-15b8e9cf3838?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Jokulsarlon',
      country: 'Iceland',
      countryCode: 'IS',
      description: 'Luminous blue icebergs calved from a glacier float across a silent lagoon toward a diamond-strewn black sand beach.',
      lat: 64.0784,
      lon: -16.2306,
      imageUrl: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Vik',
      country: 'Iceland',
      countryCode: 'IS',
      description: 'Black sand beaches meet roaring Atlantic waves beneath dramatic basalt sea stacks on Iceland\'s wild south coast.',
      lat: 63.4186,
      lon: -19.0060,
      imageUrl: 'https://images.unsplash.com/photo-1509264241942-a742d1b5f5b1?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Gullfoss',
      country: 'Iceland',
      countryCode: 'IS',
      description: 'A thundering two-tiered waterfall plunges into a deep canyon, creating shimmering rainbows in the glacial mist.',
      lat: 64.3271,
      lon: -20.1199,
      imageUrl: 'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=800&h=600&fit=crop&q=80'
    }
  ],

  india: [
    {
      name: 'Jaipur',
      country: 'India',
      countryCode: 'IN',
      description: 'The Pink City dazzles with ornate palaces, bustling bazaars, and the majestic hilltop Amber Fort.',
      lat: 26.9124,
      lon: 75.7873,
      imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Kerala',
      country: 'India',
      countryCode: 'IN',
      description: 'Emerald backwaters wind through coconut groves and spice plantations in God\'s Own Country of lush tropical beauty.',
      lat: 10.8505,
      lon: 76.2711,
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Varanasi',
      country: 'India',
      countryCode: 'IN',
      description: 'India\'s spiritual heart pulses with ancient rituals along the sacred Ganges, where life and eternity intertwine.',
      lat: 25.3176,
      lon: 82.9739,
      imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Ladakh',
      country: 'India',
      countryCode: 'IN',
      description: 'High-altitude desert monasteries perch on barren moonscapes above turquoise lakes in the roof of the world.',
      lat: 34.1526,
      lon: 77.5771,
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Goa',
      country: 'India',
      countryCode: 'IN',
      description: 'Golden beaches, Portuguese colonial churches, and swaying palms create an idyllic tropical escape on India\'s west coast.',
      lat: 15.2993,
      lon: 74.1240,
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80'
    }
  ],

  thailand: [
    {
      name: 'Bangkok',
      country: 'Thailand',
      countryCode: 'TH',
      description: 'Glittering temple spires rise above a whirlwind of street food stalls, floating markets, and electric nightlife.',
      lat: 13.7563,
      lon: 100.5018,
      imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Chiang Mai',
      country: 'Thailand',
      countryCode: 'TH',
      description: 'Hundreds of ancient temples dot this misty mountain city surrounded by lush jungles and hill tribe villages.',
      lat: 18.7883,
      lon: 98.9853,
      imageUrl: 'https://images.unsplash.com/photo-1512553714678-6f17a45e0397?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Phi Phi Islands',
      country: 'Thailand',
      countryCode: 'TH',
      description: 'Towering limestone karsts frame impossibly turquoise bays in this island paradise of the Andaman Sea.',
      lat: 7.7407,
      lon: 98.7784,
      imageUrl: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Phuket',
      country: 'Thailand',
      countryCode: 'TH',
      description: 'Thailand\'s largest island blends luxury resorts, vibrant markets, and pristine beaches with warm Andaman waters.',
      lat: 7.8804,
      lon: 98.3923,
      imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Ayutthaya',
      country: 'Thailand',
      countryCode: 'TH',
      description: 'Crumbling temple ruins and serene Buddha statues evoke the grandeur of a once-mighty Siamese kingdom.',
      lat: 14.3692,
      lon: 100.5877,
      imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=600&fit=crop&q=80'
    }
  ],

  egypt: [
    {
      name: 'Cairo',
      country: 'Egypt',
      countryCode: 'EG',
      description: 'The Great Pyramids stand sentinel at the edge of a sprawling desert metropolis alive with millennia of history.',
      lat: 30.0444,
      lon: 31.2357,
      imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Luxor',
      country: 'Egypt',
      countryCode: 'EG',
      description: 'The world\'s greatest open-air museum lines the Nile with colossal temples, royal tombs, and carved obelisks.',
      lat: 25.6872,
      lon: 32.6396,
      imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64e1cf1aab4?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Aswan',
      country: 'Egypt',
      countryCode: 'EG',
      description: 'Feluccas glide past golden dunes and Nubian villages where the Nile flows through a tranquil desert paradise.',
      lat: 24.0889,
      lon: 32.8998,
      imageUrl: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Alexandria',
      country: 'Egypt',
      countryCode: 'EG',
      description: 'A storied Mediterranean port where ancient Greco-Roman ruins meet a vibrant modern waterfront and legendary library.',
      lat: 31.2001,
      lon: 29.9187,
      imageUrl: 'https://images.unsplash.com/photo-1568322503652-c53fae7e0c47?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Siwa Oasis',
      country: 'Egypt',
      countryCode: 'EG',
      description: 'A remote desert oasis of palm groves and salt lakes where ancient Berber culture thrives far from the modern world.',
      lat: 29.2032,
      lon: 25.5195,
      imageUrl: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&h=600&fit=crop&q=80'
    }
  ],

  switzerland: [
    {
      name: 'Zurich',
      country: 'Switzerland',
      countryCode: 'CH',
      description: 'A sophisticated lakeside city where medieval Old Town charm meets sleek modern design and alpine panoramas.',
      lat: 47.3769,
      lon: 8.5417,
      imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Interlaken',
      country: 'Switzerland',
      countryCode: 'CH',
      description: 'Nestled between two emerald lakes beneath the towering Eiger, Mönch, and Jungfrau peaks in the heart of the Alps.',
      lat: 46.6863,
      lon: 7.8632,
      imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Zermatt',
      country: 'Switzerland',
      countryCode: 'CH',
      description: 'The iconic pyramid of the Matterhorn looms above this car-free alpine village of wooden chalets and world-class skiing.',
      lat: 46.0207,
      lon: 7.7491,
      imageUrl: 'https://images.unsplash.com/photo-1529973565457-a60a2ccfbc78?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Lucerne',
      country: 'Switzerland',
      countryCode: 'CH',
      description: 'A medieval covered bridge spans crystal waters against a backdrop of snow-capped peaks in Switzerland\'s fairy-tale city.',
      lat: 47.0502,
      lon: 8.3093,
      imageUrl: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800&h=600&fit=crop&q=80'
    },
    {
      name: 'Grindelwald',
      country: 'Switzerland',
      countryCode: 'CH',
      description: 'A storybook village of timber chalets beneath the dramatic north face of the Eiger in the stunning Bernese Oberland.',
      lat: 46.6240,
      lon: 8.0414,
      imageUrl: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&h=600&fit=crop&q=80'
    }
  ]
};

/**
 * Build a reverse lookup map: city name (lowercase) → country key
 */
const cityToCountryMap = new Map();
for (const [countryKey, dests] of Object.entries(destinations)) {
  for (const dest of dests) {
    cityToCountryMap.set(dest.name.toLowerCase(), countryKey);
  }
}

/**
 * Get the country key for a given city name.
 * @param {string} cityName - The name of the city (case-insensitive)
 * @returns {string|null} The country key or null if not found
 */
export function getCountryFromCity(cityName) {
  if (!cityName) return null;
  return cityToCountryMap.get(cityName.toLowerCase()) || null;
}

/**
 * Get all destinations for a given country key.
 * @param {string} countryKey - The country key (lowercase, e.g. 'japan')
 * @returns {Array} Array of destination objects, or empty array if not found
 */
export function getDestinationsForCountry(countryKey) {
  if (!countryKey) return [];
  return destinations[countryKey.toLowerCase()] || [];
}
